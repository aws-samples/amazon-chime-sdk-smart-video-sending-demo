const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({ region: process.env.AWS_REGION });

const {
  CONNECTION_TABLE,
  VIDEO_SENDINGS_TABLE,
} = process.env;

const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
const MAX_VIDEO_NUMBER = 2; // It should be 16, use 2 for testing purpose

exports.onconnect = async event => {
  console.log('onconnect event:', JSON.stringify(event, null, 2));

  const meetingId = event.queryStringParameters.meetingId;
  const attendeeId = event.queryStringParameters.attendeeId;
  if (!meetingId || !attendeeId) {
    console.error('Missing meetingId or attendeeId');
    return { statusCode: 400, body: 'Must have meetingId and attendeeId to connect' };
  }

  try {
    await ddb.putItem({
      TableName: CONNECTION_TABLE,
      Item: {
        MeetingId: { S: meetingId },
        AttendeeId: { S: attendeeId },
        ConnectionId: { S: event.requestContext.connectionId },
        TTL: { N: '' + oneDayFromNow }
      }
    }).promise();
    return { statusCode: 200, body: 'Connected.' };
  } catch (e) {
    console.error(`error connecting: ${e.message}`);
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(e) };
  }
};

exports.ondisconnect = async event => {
  console.log('ondisconnect event:', JSON.stringify(event, null, 2));
  const connectionId = event.requestContext.connectionId;

  try {
    const connectionObj = await getConnectionObj(connectionId);
    const meetingId = connectionObj.MeetingId.S;
    const attendeeId = connectionObj.AttendeeId.S;

    await ddb.deleteItem({
      TableName: VIDEO_SENDINGS_TABLE,
      Key: {
        AttendeeId: { S: attendeeId },
        MeetingId: { S: meetingId },
      }
    }).promise();

    // Some one left the meeting, need to check if need to promote another to send video
    await promotePendingAttendee(event, meetingId);
  } catch (e) {
    console.error(`Failed to update VIDEO_SENDINGS_TABLE ondisconnect: ${e}`);
  }

  try {
    await ddb.deleteItem({
      TableName: CONNECTION_TABLE,
      Key: {
        ConnectionId: { S: connectionId },
      }
    }).promise();
    return { statusCode: 200, body: 'Disconnected.' };
  } catch (e) {
    console.error(`Failed to disconnect with error: ${e}`);
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(e) };
  }
};

exports.sendmessage = async event => {
  console.log('sendmessage event:', JSON.stringify(event, null, 2));
  const message = JSON.parse(event.body).data;
  const connectionId = event.requestContext.connectionId;
  const messageType = JSON.parse(message).type;
  
  let responseMsg = {};

  if (messageType === "ping") {
    responseMsg = {
      type: 'ping',
      message: "pong",
    };
  } else {
    const connectionObj = await getConnectionObj(connectionId);
    const meetingId = connectionObj.MeetingId.S;
    const attendeeId = connectionObj.AttendeeId.S;

    if (messageType === "start-video") {
      // Check total ppl count (sending video + pending sending video)
      console.log("messageType is start-video");
      const attendees = await ddb.query({
        TableName: VIDEO_SENDINGS_TABLE,
        KeyConditionExpression: "MeetingId = :meetingId",
        ExpressionAttributeValues: {
          ":meetingId": { S: meetingId },
        },
        Select: 'COUNT',
      }).promise();
      const attendeesCount = JSON.parse(attendees.Count);

      try {
        await ddb.putItem({
          TableName: VIDEO_SENDINGS_TABLE,
          Item: {
            AttendeeId: { S: attendeeId },
            MeetingId: { S: meetingId },
            ConnectionId: { S: connectionId },
            SendingVideoState: { BOOL: true },
            SendingTime: { N: '' + Date.now()},
            TTL: { N: '' + oneDayFromNow }
          }
        }).promise();
      } catch(e) {
        console.error(`error adding to VIDEO_SENDINGS_TABLE: ${e.message}`);
        return { statusCode: 500, body: JSON.stringify(e) };
      }
      // If < 16 ppl in the table, the attendee can send video
      if (attendeesCount < MAX_VIDEO_NUMBER) {
        console.log("attendeesCount < 16");
        responseMsg = {
          type: "start-video",
          message: "Fewer than 16 attendees, send video!"
        };
      } else {
        // If >= 16 ppl in the table, the 'oldest' attendee who is sending video should stop
        console.log("attendeesCount >= 16");
        const sendingAttendees = await ddb.query({
          TableName: VIDEO_SENDINGS_TABLE,
          IndexName: "TimeIndex",
          KeyConditionExpression: "MeetingId = :meetingId",
          ExpressionAttributeValues: {
            ":meetingId": { S: meetingId },
            ":isSending": { BOOL: true }
          },
          FilterExpression: "SendingVideoState = :isSending"
        }).promise();

        console.log("sendingAttendees", JSON.stringify(sendingAttendees));
        const oldestAttendee = sendingAttendees.Items[0];
        await downgradeActiveAttendee(event, oldestAttendee.ConnectionId.S, oldestAttendee.AttendeeId.S, meetingId);

        responseMsg = {
          type: "start-video",
          message: "You are set to send video!"
        };
      }
    }
    else if (messageType === "stop-video") {
      // Remove the attendee from the table, and send back stop message
      console.log("messageType is stop-video");
      try {
        await ddb.deleteItem({
          TableName: VIDEO_SENDINGS_TABLE,
          Key: {
            AttendeeId: { S: attendeeId },
            MeetingId: { S: meetingId },
          }
        }).promise();
        
      } catch (e) {
        console.error(`Failed to remove item: ${e}`);
      }
      // The attendee stops the video sending, need to check if need to promote another to send video
      await promotePendingAttendee(event, meetingId);
      
      responseMsg = {
        type: "stop-video"
      };
    }
  }
  
  try {
    await postToConnection(apigwManagementApi(event), connectionId, JSON.stringify(responseMsg));
  } catch (e) {
    console.error(`Failed to post message: ${e.message}`);
    return { statusCode: 500, body: e.stack };
  }
  return { statusCode: 200, body: 'Data sent.' };
};

exports.ping = async event => {
  console.log('ping event:', JSON.stringify(event, null, 2));
  const connectionId = event.requestContext.connectionId;
  const message = {
    type: 'ping',
    message: "pong",
  };

  try {
    await postToConnection(apigwManagementApi(event), connectionId, JSON.stringify(message));
  } catch (e) {
    console.error(`Failed to post ping message: ${e.message}`);
    return { statusCode: 500, body: e.stack };
  }
  return { statusCode: 200, body: 'Pong!.' };
};

const promotePendingAttendee = async (event, meetingId) => {
  const notSendingAttendees = await ddb.query({
    TableName: VIDEO_SENDINGS_TABLE,
    IndexName: "TimeIndex",
    KeyConditionExpression: "MeetingId = :meetingId",
    ExpressionAttributeValues: {
      ":meetingId": { S: meetingId },
      ":isSending": { BOOL: false }
    },
    FilterExpression: "SendingVideoState = :isSending"
  }).promise();

  console.log("notSendingAttendees", JSON.stringify(notSendingAttendees));
  const notSendingcount = JSON.parse(notSendingAttendees.Count);
  const sendingCount = JSON.parse(notSendingAttendees.ScannedCount) - JSON.parse(notSendingAttendees.Count);

  if (sendingCount < MAX_VIDEO_NUMBER && notSendingcount > 0) {
    const attendeeToSend = notSendingAttendees.Items[0];
    const msg = {
      type: "start-video",
      message: "Someone left, send video!"
    };
    try {
      await postToConnection(apigwManagementApi(event), attendeeToSend.ConnectionId.S, JSON.stringify(msg));
      
      await ddb.updateItem({
        TableName: VIDEO_SENDINGS_TABLE,
        Key: {
          MeetingId: { S: meetingId },
          AttendeeId: { S: attendeeToSend.AttendeeId.S },
        },
        UpdateExpression: "SET SendingVideoState = :isSending, SendingTime = :sendingTime",
        ExpressionAttributeValues: {
          ":isSending": { BOOL: true },
          ":sendingTime": { N: '' + Date.now() },
        },
      }).promise();
    } catch (e) {
      console.error(`Failed to promote pending attendee ${e.message}`);
    }
  }
};

const downgradeActiveAttendee = async (event, connectionId, attendeeId, meetingId) => {
  const msg = {
    type: "stop-video",
    message: "Someone else need to share video"
  };
  try {
    await postToConnection(apigwManagementApi(event), connectionId, JSON.stringify(msg));

    await ddb.updateItem({
      TableName: VIDEO_SENDINGS_TABLE,
      Key: {
        AttendeeId: { S: attendeeId },
        MeetingId: { S: meetingId },
      },
      UpdateExpression: "SET SendingVideoState = :isSending, SendingTime = :sendingTime",
      ExpressionAttributeValues: {
        ":isSending": { BOOL: false },
        ":sendingTime": { N: '' + Date.now() },
      },
    }).promise();
  } catch (e) {
    console.error(`Failed to downgrade active attendee ${e.message}`);
  }
};

const getConnectionObj = async (connectionId) => {
  const response = await ddb.getItem({
    Key: {
      ConnectionId: { S: connectionId },
    },
    TableName: CONNECTION_TABLE,
  }).promise();
  return response.Item;
};

const apigwManagementApi = event => {
  console.log("endpoint: ", event.requestContext.domainName + '/' + event.requestContext.stage);
  return new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });
};

const postToConnection = async (postApi, connectionId, message) => {
  try {
    await postApi.postToConnection({ ConnectionId: connectionId, Data: message }).promise();
    console.log('Successfully posted to connection with ConnectionId ' + connectionId);
    return;
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection, skipping ${connectionId}`);
    }
    else {
      console.error(`Error posting to connection ${connectionId}: ${e.message}`);
    }
  }
};
