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
  const attendeeRole = event.queryStringParameters.attendeeRole;

  if (!meetingId || !attendeeId || !attendeeRole) {
    console.error('Missing meetingId, attendeeId or attendeeRole');
    return { statusCode: 400, body: 'Must have meetingId, attendeeId and attendeeRole to connect' };
  }

  try {
    await ddb.putItem({
      TableName: CONNECTION_TABLE,
      Item: {
        MeetingId: { S: meetingId },
        AttendeeId: { S: attendeeId },
        ConnectionId: { S: event.requestContext.connectionId },
        AttendeeRole: { S: attendeeRole },
        TTL: { N: '' + oneDayFromNow }
      }
    }).promise();
  } catch (e) {
    console.error(`error connecting: ${e.message}`);
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(e) };
  }

  return { statusCode: 200, body: 'Connected.' };
};

exports.ondisconnect = async event => {
  console.log('ondisconnect event:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    const connectionObj = await getConnectionObj(connectionId);
    const meetingId = connectionObj.MeetingId.S;
    const attendeeId = connectionObj.AttendeeId.S;
    const attendeeRole = connectionObj.AttendeeRole.S;

    await ddb.deleteItem({
      TableName: VIDEO_SENDINGS_TABLE,
      Key: {
        AttendeeId: { S: attendeeId },
        MeetingId: { S: meetingId },
      }
    }).promise();
  } catch (e) {
    console.error(`Failed to update VIDEO_SENDINGS_TABLE ondisconnect: ${e}`);
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(e) };
  }

  try {
    await ddb.deleteItem({
      TableName: CONNECTION_TABLE,
      Key: {
        ConnectionId: { S: connectionId },
      }
    }).promise();
  } catch (e) {
    console.error(`Failed to update CONNECTION_TABLE ondisconnect: ${e}`);
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(e) };
  }

  // If a student is disconnected, notify the instructor about this change
  if (attendeeRole === 'student') {
    await getInstructorAndSendVideoEnabledAttendees(event, meetingId);
  }

  return { statusCode: 200, body: 'Disconnected.' };
};

exports.sendmessage = async event => {
  console.log('sendmessage event:', JSON.stringify(event, null, 2));

  const message = JSON.parse(JSON.parse(event.body).data);
  const connectionId = event.requestContext.connectionId;
  const messageType = message.type;
  const messagePayload = message.payload;

  let responseMsg;

  if (messageType === "ping") {
    responseMsg = {
      type: 'ping',
      message: "pong",
    };
  } else {
    const connectionObj = await getConnectionObj(connectionId);
    const meetingId = connectionObj.MeetingId.S;
    const attendeeId = connectionObj.AttendeeId.S;
    const attendeeRole = connectionObj.AttendeeRole.S;

    if (messageType === "list-available-videos" && attendeeRole === 'instructor') {
      try {
         await sendVideoEnabledAttendeesToInstructor(event, meetingId, connectionId);
      } catch (e) {
        console.error(`Failed to send video-enabled attendees to instructor: ${e.message}`);
        return { statusCode: 500, body: e.stack };
      }
      return { statusCode: 200, body: 'Data sent.' };
    } else if (messageType === "start-video") {
      console.log("messageType is start-video");
      let sendingVideo;

      // If it's instructor's video, start it directly
      if (attendeeRole === 'instructor') {
        sendingVideo = true;
        responseMsg = {
          type: "start-video",
          message: "Start instructor video directly"
        };
      }
      // If it's student's video, simply notify the instructor without starting the video
      else if (attendeeRole === 'student') {
        sendingVideo = false;
      }

      try {
        await ddb.putItem({
          TableName: VIDEO_SENDINGS_TABLE,
          Item: {
            AttendeeId: { S: attendeeId },
            AttendeeRole: { S: attendeeRole },
            MeetingId: { S: meetingId },
            ConnectionId: { S: connectionId },
            SendingVideoState: { BOOL: sendingVideo },
            SendingTime: { N: '' + Date.now()},
            TTL: { N: '' + oneDayFromNow }
          }
        }).promise();
      } catch (e) {
        console.error(`error adding to VIDEO_SENDINGS_TABLE: ${e.message}`);
        return { statusCode: 500, body: JSON.stringify(e) };
      }

      // Notify instructor (if any) with the latest attendee info
      await getInstructorAndSendVideoEnabledAttendees(event, meetingId);
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

      responseMsg = {
        type: "stop-video"
      };

      // Notify instructor (if any) with the latest attendee info
      await getInstructorAndSendVideoEnabledAttendees(event, meetingId);
    }
    else if (messageType === "toggle-student-video") {
      console.log("messageType is toggle-student-video");

      const targetAttendeeId = messagePayload.attendeeId;
      const targetAttendeeConnection = await getConnectionFromMeetingIdAndAttendeeId(meetingId, targetAttendeeId);
      if (attendeeRole === 'instructor' && targetAttendeeConnection) {
        try {
          await ddb.putItem({
            TableName: VIDEO_SENDINGS_TABLE,
            Item: {
              AttendeeId: { S: targetAttendeeId },
              AttendeeRole: { S: targetAttendeeConnection.attendeeRole },
              MeetingId: { S: meetingId },
              ConnectionId: { S: targetAttendeeConnection.connectionId },
              SendingVideoState: { BOOL: messagePayload.isSendingVideo },
              SendingTime: { N: '' + Date.now()},
              TTL: { N: '' + oneDayFromNow }
            }
          }).promise();
        } catch(e) {
          console.error(`error updating VIDEO_SENDINGS_TABLE on toggle-student-video: ${e.message}`);
          return { statusCode: 500, body: JSON.stringify(e) };
        }

        try {
          await postToConnection(apigwManagementApi(event), targetAttendeeConnection.connectionId, JSON.stringify({
            type: messagePayload.isSendingVideo ? 'start-video' : "stop-video"
          }));
        } catch (e) {
          console.error(`Failed to post message on toggle-student-video: ${e.message}`);
          return { statusCode: 500, body: e.stack };
        }

        try {
          await sendVideoEnabledAttendeesToInstructor(event, meetingId, connectionId);
        } catch (e) {
          console.error(`Failed to send video-enabled attendees to instructor: ${e.message}`);
          return { statusCode: 500, body: e.stack };
        }
      }
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
  if (!message) { return; }

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

// Get all attendees who have video enabled (sending video + pending sending video)
const getAttendeesWithVideoEnabled = async (meetingId) => {
  const attendees = await ddb.query({
    TableName: VIDEO_SENDINGS_TABLE,
    KeyConditionExpression: "MeetingId = :meetingId",
    ExpressionAttributeValues: {
      ":meetingId": { S: meetingId },
    }
  }).promise();

  return attendees.Items.map(attendee => ({
    attendeeId: attendee.AttendeeId.S,
    attendeeRole: attendee.AttendeeRole.S,
    meetingId: attendee.MeetingId.S,
    connectionId: attendee.ConnectionId.S,
    sendingVideoState: attendee.SendingVideoState.BOOL,
    sendingTime: attendee.SendingTime.N,
    ttl: attendee.TTL.N
  }));
}

// Get the instructor connection details of a specific meeting
const getInstructorOfMeeting = async (meetingId) => {
  const connections = await ddb.query({
    TableName: CONNECTION_TABLE,
    IndexName: "MeetingIdIndex",
    KeyConditionExpression: "MeetingId = :meetingId",
    ExpressionAttributeValues: {
      ":meetingId": { S: meetingId },
      ":attendeeRole": { S: 'instructor' }
    },
    FilterExpression: "AttendeeRole = :attendeeRole"
  }).promise();

  const connection = connections.Items && connections.Items[0];
  if (connection) {
    return {
      meetingId: connection.MeetingId.S,
      attendeeId: connection.AttendeeId.S,
      attendeeRole: connection.AttendeeRole.S,
      connectionId: connection.ConnectionId.S,
      ttl: connection.TTL.N
    }
  } else {
    return null;
  }
}

// Get the connection details of a specific attendee in a meeting
const getConnectionFromMeetingIdAndAttendeeId = async (meetingId, attendeeId) => {
  const connections = await ddb.query({
    TableName: CONNECTION_TABLE,
    IndexName: "MeetingIdIndex",
    KeyConditionExpression: "MeetingId = :meetingId and AttendeeId = :attendeeId",
    ExpressionAttributeValues: {
      ":meetingId": { S: meetingId },
      ":attendeeId": { S: attendeeId }
    }
  }).promise();

  const connection = connections.Items && connections.Items[0];
  if (connection) {
    return {
      meetingId: connection.MeetingId.S,
      attendeeId: connection.AttendeeId.S,
      attendeeRole: connection.AttendeeRole.S,
      connectionId: connection.ConnectionId.S,
      ttl: connection.TTL.N
    }
  } else {
    return null;
  }
}

const sendVideoEnabledAttendeesToInstructor = async (event, meetingId, instructorConnectionId) => {
  const videoEnabledAttendees = await getAttendeesWithVideoEnabled(meetingId);
  const messageForInstructor = {
    type: 'list-available-videos',
    message: videoEnabledAttendees
  }
  await postToConnection(apigwManagementApi(event), instructorConnectionId, JSON.stringify(messageForInstructor));
}

const getInstructorAndSendVideoEnabledAttendees = async (event, meetingId) => {
  try {
    const instructor = await getInstructorOfMeeting(meetingId);
    if (instructor) {
      await sendVideoEnabledAttendeesToInstructor(event, meetingId, instructor.connectionId);
    }
  } catch (e) {
    console.error(`Failed to send video-enabled attendees to the instructor: ${e}`);
  }
}
