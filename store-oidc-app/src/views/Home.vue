<template>
    <v-app id="keep">
    <!-- Bar -->
    <v-app-bar
      app
      dark
      color="blue"
      elevation="6"
      flat
      clipped-left
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <span class="title ml-3 mr-5">Best&nbsp;<span class="font-weight-light">eMarket</span></span>
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Search"
      ></v-text-field>
      <v-btn icon @click="request" v-if="page=='products'">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="page='products'">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn icon @click="page='tokens'">
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn icon @click="page='settings'">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
       <span v-if="response && response.profile">
        <v-icon
          color="grey lighten-3"
          large
        >
          mdi-account-circle
        </v-icon> 
        {{response.profile.name}}
      </span>
       <v-btn icon @click="logout()">
          <v-icon>mdi-logout</v-icon>
       </v-btn>
    </v-app-bar>
    <v-main class="grey lighten-4">
      <v-progress-linear v-if="service.loading" :indeterminate="true" />
      <v-alert v-if="this.error.show"
				color="red"
				dense
				dismissible
				elevation="8"
				prominent
				text
				type="error"
			>{{this.error.detail}}</v-alert>
      <v-container
        fluid
        class="grey lighten-4"
      >
        <!-- Products page content -->
        <v-row v-if="page=='products' && !this.error.show"
          justify="center"
          align="center"
        >
           <v-col
            v-for="result in results"
            :key="result.title"
            cols="3"
          >
          <v-card>
            <v-img
              :src='result.url'
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="250px"
            >
            </v-img>
            <v-card-title>
              {{result.name}}
            </v-card-title>
            <v-card-subtitle>
               {{result.description}}
            </v-card-subtitle>
            <v-card-text>
              <v-row
                align="center"
                class="mx-0"
              >
                <v-rating
                  :value="result.id"
                  color="amber"
                  dense
                  half-increments
                  readonly
                  size="14"
                ></v-rating>
                <div class="grey--text ml-4">{{result.id}} (200)</div>
              </v-row>
            </v-card-text>
            <v-card-actions>
               <v-btn text>Details</v-btn>
                <v-btn
                  text
                >
                  Buy
                </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        </v-row>
        <!-- Token page content -->
        <v-row v-if="page=='tokens'">
          <v-expansion-panels popout>
            <v-expansion-panel>
              <v-expansion-panel-header>ID Token</v-expansion-panel-header>
              <v-expansion-panel-content>
                  {{response.id_token}}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>ID Token Payload</v-expansion-panel-header>
              <v-expansion-panel-content>
                  {{response.profile}}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
            <v-expansion-panel-header>Access Token</v-expansion-panel-header>
              <v-expansion-panel-content>
                  {{accessToken}}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Scopes</v-expansion-panel-header>
              <v-expansion-panel-content>
                  {{response.scope}}
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
        <!-- Setting page content -->
        <v-row v-if="page=='settings'">
            <v-col cols="12" sm="12">
              <v-text-field
                v-model="service.url"
                label="API Endpoint"
                outlined
                clearable
              ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
   </v-app>
</template>
<script>
import { mapGetters } from "vuex";
import axios from 'axios'

export default {
  name: 'User',
  data: () => ({
    results: null,
    page : "products", // Default page
    service : {
      url : process.env.VUE_APP_API_URL || "/api/products",
      loading : false
    },
    error: {
			show : false,
			detail : null,
			errorCodes : {
				401 : "Your are not authorized to access to this resourced. (Error: Code 401)",
				403 : "Access forbidden. You are not allowed to access this resource. (Error: Code 403) ",
        404 : "Service not Found. (Error: Code 404)"
			}
		},
    drawer: null
  }),
  watch: {
    page: function (pageName) {
      this.error.show = false;
      if(pageName=="products"){
				this.request();
			}
    }
  },    
  computed: {
    ...mapGetters({
        accessToken : 'auth/accessToken',
        response : 'auth/tokenResponse'
      })
  },
  methods: {
    request : function() 
    {
        this.service.loading = true;
        this.error.show = false;        
        // this.results = this.mockProducts;
        // this.service.loading = false;
        let authHeader = { headers: { Authorization: 'Bearer ' + this.accessToken } };
        axios.get(this.service.url, authHeader).then((response) => {
          this.results = response.data;
          this.service.loading = false;
          console.log(this.results)
        }).catch( error => { 
          console.log(error); 
          this.error.show =true;
          if(error.response){
            this.error.detail = this.error.errorCodes[error.response.status];
          }
          this.error.detail = this.error.detail  || "We received a server error"
          this.service.loading = false;
        });
    },
    logout : function () {
      //TODO: Not implemented yet
      this.$store.dispatch("auth/signOut");
    }
  },
  created() {
    this.request();
  },
  logout : function () {
			this.$store.dispatch("auth/signOut");
	}
}
</script>