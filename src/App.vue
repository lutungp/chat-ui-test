<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div v-if="!isLogin">
      <label for="">User</label><input type="text" v-model="userid">&nbsp;
      <label for="">Layanan</label><input type="text" v-model="userlayanan">&nbsp;
      <label for="">Mitra</label><input type="text" v-model="usermitra">&nbsp;
      <button @click="connect">Connect</button>
    </div>
    <div v-else>
      <label for="">mitra</label><input type="text" v-model="idmitra">&nbsp;
      <label for="">layanan</label><input type="text" v-model="idlayanan">&nbsp;
      <button @click="approvalLayanan">Ask Approval</button>
      <br>
      <br>
      <button @click="disconnect">Disconnect</button>
      <div>
        <table width="100%">
          <thead>
            <tr>
              <th align="center">No.</th>
              <th align="center">Description</th>
              <th align="center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in approvalid" v-bind:key="index">
              <td align="ceter">{{ index+1 }}</td>
              <td>{{ item }}</td>
              <td>
                <button type="button" @click="approved(item)">approved</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <table>
          <tr>
            <td>
              <label for="">Room</label>
              <input type="text" v-model="roomchat_id">
            </td>
          </tr>
          <tr>
            <td>
              <label for="">User</label>
              <select name="" id="" v-model="userrole">
                <option value="customer">CUSTOMER</option>
                <option value="partner">PARTNER</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <textarea name="" id="" cols="30" rows="10" v-model="inbox"></textarea>
            </td>
          </tr>
          <tr>
            <td>
              <textarea name="" id="" cols="30" rows="10" v-model="message"></textarea>
            </td>
          </tr>
          <tr>
            <td>
              <button @click="sendMessage()">send</button>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import socket from "./socket";
import axios from 'axios'

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  data() {
    return {
      isLogin: false,
      userid: "",
      userlayanan: "",
      usermitra: "",
      idUser: "",
      idmitra : "",
      idlayanan: "",
      approvalid: [],
      sessionID: localStorage.getItem("sessionID"),
      roomchat: [],
      roomchat_id: '',
      message: '',
      inbox: '',
      userrole: ''
    }
  },
  created(){
    socket.connect();
    if (this.sessionID) {
      this.isLogin = true;
      this.getSession(this.sessionID);
    }

    socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
      console.log({
        'roomchat_id' : roomchat_id,
        'usertujuan_id' : usertujuan_id,
        'message' : message
      })
    })
  },
  methods : {
    connect: function(){
      let me = this;
      socket.emit('userLogin', {
        id: null,
        user_uuid: me.userid,
        layanan_uuid: me.userlayanan,
        mitra_uuid: me.usermitra
      });

      socket.on("session", ({ sessionID }) => {
        // attach the session ID to the next reconnection attempt
        socket.auth = {
          id: sessionID,
          user_uuid: me.userid,
          layanan_uuid: me.userlayanan,
          mitra_uuid: me.usermitra
        };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionID);
        this.getRoomChat(sessionID);
        // save the ID of the user
        me.isLogin = true;
      });

      socket.on("askApproval", ({ to, id }) => {
        alert("to : " + to);
        me.approvalid.push(id);
      })

      socket.on('askApprovalResponse', ({to, approved, roomid}) => {
        console.log(to)
        console.log(approved)
        console.log(roomid)
      })

      socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
        console.log({
          'roomchat_id' : roomchat_id,
          'usertujuan_id' : usertujuan_id,
          'message' : message
        })
      })
    },
    reconnect: function () {
      let me = this;
      socket.emit('userLogin', {
        id: me.sessionID,
        user_uuid: me.userid,
        layanan_uuid: me.userlayanan,
        mitra_uuid: me.usermitra
      });

      socket.on("session", ({ sessionID }) => {
        // attach the session ID to the next reconnection attempt
        socket.auth = {
          id: sessionID,
          user_uuid: me.userid,
          layanan_uuid: me.userlayanan,
          mitra_uuid: me.usermitra
        };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionID);
        this.getRoomChat(sessionID);
        // save the ID of the user
        me.isLogin = true;
      });

      socket.on("askApproval", ({ to, id }) => {
        alert("to : " + to);
        me.approvalid.push(id);
      })

      socket.on('askApprovalResponse', ({to, approved, roomid}) => {
        console.log(to)
        console.log(approved)
        console.log(roomid)
      });
    
      socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
        console.log({
          'roomchat_id' : roomchat_id,
          'usertujuan_id' : usertujuan_id,
          'message' : message
        })
      });
    },
    approvalLayanan: function() {
      socket.emit('approvalLayanan', {
        idmitra: this.idmitra,
        idlayanan: this.idlayanan
      });
      socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
        console.log({
          'roomchat_id' : roomchat_id,
          'usertujuan_id' : usertujuan_id,
          'message' : message
        })
      })      
    },
    disconnect: function(){
      this.isLogin = false;
      socket.emit('userLogout');
    },
    approved(id){
      socket.emit('approvingLayanan', id);
      socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
        console.log({
          'roomchat_id' : roomchat_id,
          'usertujuan_id' : usertujuan_id,
          'message' : message
        })
      })
    },
    getSession(id){
      let me = this;
      axios.get('http://localhost:8000/sessionactive/' + id)
      .then(res => {
        console.log(res)
        if (res.data.total > 0) {
          me.userid    = res.data.data.user_uuid;
          me.userlayanan = res.data.data.layanan_uuid;
          me.usermitra   = res.data.data.mitra_uuid;

          me.reconnect();
        } else {
          me.isLogin = false;
          localStorage.removeItem("sessionID");
        }
      }).catch ((err) => {
        console.log(err);
      })
    },
    getRoomChat(id){
      let me = this;
      axios.get('http://localhost:8000/myroomchat/' + id)
      .then(res => {
        me.roomchat = res.data.data
      }).catch ((err) => {
        console.log(err);
      })
    },
    sendMessage(){
      let me = this;
      var message = {
        roomchat_id: me.roomchat_id,
        userrole: me.userrole,
        message: me.message
      };

      socket.emit('sendPrivateMsg', message);

      socket.on("gotPrivateMsg", ({ roomchat_id, usertujuan_id, message }) => {
        console.log({
          'roomchat_id' : roomchat_id,
          'usertujuan_id' : usertujuan_id,
          'message' : message
        })
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
