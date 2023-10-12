<template>
   <v-app id="inspire">
      <v-app-bar
          app
          dark
          color="blue"
          elevation="4"
        >
        <v-toolbar-title><span class="title ml-3 mr-5">Best&nbsp;<span class="font-weight-light">eMarket</span></span></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text v-on:click="signIn"> 
            <v-icon>mdi-login</v-icon>
            Log In
        </v-btn>
    </v-app-bar>
    <v-container
      fluid>
      <v-row class="fill-height">
        <v-img
            :src="`login.png`"
            :aspect-ratio="16/9"
            :width="`100`"
          ></v-img>
      </v-row>   
      <!--
      <v-row 
        align="center" 
        justify="center">
        <v-col class="text-center">
            <h1 class="display-1 font-weight-thin mb-4">Welcome to our online store!</h1>
        </v-col>
      </v-row>
      -->
    </v-container>
    <v-footer style="background-color:#e9e9eb">
        <v-row justify="center" no-gutters>
        <v-col class="text-center mb-5" cols="12">
          Sample provided by <a style="text-decoration: none;" href="https://twogenidentity.com"> ©2023 TwoGenIdentity.</a> All rights reserved 
        </v-col>
        </v-row>
    </v-footer>
    </v-app>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    signIn: function () {
        this.$store.dispatch("auth/signin");
    }
  }
}
</script>