<template>
  <v-menu offset-y left transition="slide-y-transition">
    <template v-slot:activator="{ on }">
      <v-btn icon class="elevation-2" v-on="on">
        <v-badge
          :color="isConnected ? 'success' : 'error'"
          dot
          bordered
          offset-x="10"
          offset-y="10"
        >
          <v-avatar size="40">
            <v-img src="/images/avatars/user.jpg"></v-img>
          </v-avatar>
        </v-badge>
      </v-btn>
    </template>
    <v-list dense nav>
      <!-- <v-list-item
        link
        :disabled="isConnected"
        @click="connectToMetaMask"
      >
        <v-list-item-icon>
          <v-icon small>mdi-cog-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Connect To MetaMask</v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
      <v-list-item
        link
        :disabled="!isConnected"
        @click="goToDashboard"
      >
        <v-list-item-icon>
          <v-icon small>mdi-monitor-dashboard</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>My Dashboard</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        link
        @click="goToWebSite"
      >
        <v-list-item-icon>
          <v-icon small>mdi-bee</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Go to website</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item
        link
        @click="openNetworkInfoModal"
      >
        <v-list-item-icon>
          <v-icon small>mdi-cogs</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Network Info</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    
  </v-menu>
</template>

<script>

export default {
  computed: {
    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    account() {
      return this.$store.getters['user/account'];
    }
  },

  methods: {
    connectToMetaMask() {
      if (!this.isConnected) {
        this.$store.dispatch('user/connectToMetaMask');
      }
    },

    goToWebSite() {
      window.location = 'https://www.algopainter.art';
    },

    goToDashboard() {
      this.$router.push('/');
    },

    openNetworkInfoModal() {
      this.$emit('toggleNetworkInfo', true);
    }
  }
}
</script>
