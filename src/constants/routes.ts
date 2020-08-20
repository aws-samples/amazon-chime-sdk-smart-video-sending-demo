const awsPath: string = '/Prod';
const rootPath: string = window.location.href.includes(awsPath) ? `${awsPath}/` : '/';

const routes = {
  HOME: `${rootPath}`,
  DEVICE: `${rootPath}devices`,
  MEETING: `${rootPath}meeting`,
}

export default routes;
