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
              <th align="center">Actioni</th>
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
      sessionID: localStorage.getItem("sessionID")
    }
  },
  created(){
    socket.connect();
    if (this.sessionID) {
      this.isLogin = true;
      this.getSession(this.sessionID);
    }
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
        // save the ID of the user
        me.isLogin = true;
      });
    },
    approvalLayanan: function() {
      socket.emit('approvalLayanan', {
        idmitra: this.idmitra,
        idlayanan: this.idlayanan
      });
    },
    disconnect: function(){
      this.isLogin = false;
      socket.emit('userLogout');
    },
    approved(id){
      socket.emit('approvingLayanan', id);
    },
    getSession(id){
      let me = this;
        axios.get('http://localhost:8000/sessionactive/' + id)
        .then(res => {
          if (res.data.total > 0) {
            me.userid    = res.data.data.usersocket_uuid;
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
