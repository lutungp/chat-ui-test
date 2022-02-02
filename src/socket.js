import { io } from "socket.io-client";

const URL = "http://localhost:3001";
// const URL = "https://connect.internaldarbegroup.com";

var token = "b35cc6e1-b979-4b27-b3f6-2b5efcc7fcc7";

const socket = io(URL, {
  extraHeaders: {
    Authorization: 'Bearer ' + token,
  },
  query: {
    foo: "bar"
  }
});

// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });

export default socket;
