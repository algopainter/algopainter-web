<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>My Robots</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" class="mr-4" @click="goToNew()">
          New Paiting
          <v-icon right>mdi-file-star-outline</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>

    <v-divider class="my-2"></v-divider>
    <v-container fluid v-if="loading">
      <v-row dense>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row dense>
        <v-col v-for="(stat, i) in stats" :key="i" cols="12" md="4" lg="4">
          <v-card class="pa-3 text-center">
            <div class="overline mb-2">
              <v-rating
                v-model="stat.star"
                length="3"
                background-color="orange lighten-3"
                color="orange"
                large
              ></v-rating>
            </div>
            <div class="text-h4">{{ stat.value }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid v-if="loading">
      <v-row dense>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row dense>
        <v-col
          cols="12"
          md="3"
          :key="proposal.id"
          v-for="proposal in proposals"
        >
          <v-card>
            <v-app-bar flat>
              <v-toolbar-title>
                {{ proposal.content.name }}
              </v-toolbar-title>
              <v-chip
                v-if="proposal.isFinished"
                x-small
                color="error"
                class="font-weight-bold ml-1"
                >Finished</v-chip
              >
              <v-spacer></v-spacer>
              <mark-button :proposalId="proposal.id" />
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="goToFinish(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-cards</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Finish
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="goToHistory(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-history</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Show History
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="goToProposal(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-share-all</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      View
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-app-bar>
            <div class="pa-3">
              <div class="d-flex align-center flex-column">
                <v-avatar small size="120">
                  <robo-hash-address
                    size="120"
                    :address="proposal.votingOwner"
                  />
                </v-avatar>
                <div class="text-center mt-2">
                  <div class="secondary--text text--lighten-1 text-caption">
                    {{ proposal.tokenInfo.symbol }}
                  </div>
                  <div class="secondary--text text--lighten-1 text-caption">
                    Block Limit: {{ proposal.blockLimit }}
                  </div>
                  <v-chip
                    v-if="proposal.blockLimit < currentBlockNumber"
                    x-small
                    color="error"
                    class="font-weight-bold ml-1"
                    >Expired</v-chip
                  >
                  <v-chip
                    v-if="proposal.blockLimit >= currentBlockNumber"
                    x-small
                    color="success"
                    class="font-weight-bold ml-1"
                    >Active</v-chip
                  >
                </div>
                
              </div>
              
            </div>
            <v-divider></v-divider>
            <div class="d-flex">
              <v-btn
                @click="goToProposal(proposal.id)"
                class="flex-grow-1"
                tile
                height="48"
                text
              >
                <v-icon left>mdi-share-all</v-icon>
                View
              </v-btn>
              <v-divider vertical></v-divider>
              <v-btn
                :disabled="
                  proposal.isFinished ||
                    proposal.blockLimit < currentBlockNumber
                "
                @click="openVoteDialog(proposal)"
                class="flex-grow-1"
                tile
                height="48"
                text
              >
                <v-icon left>mdi-vote</v-icon>
                Vote
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center" v-if="pageCount > 1">
      <v-container>
        <v-row justify="center">
          <v-col cols="8">
            <v-container class="max-width">
              <v-pagination
                v-model="page"
                class="my-4"
                :length="pageCount"
              ></v-pagination>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import IPFSHelper from "@/lib/helpers/IPFSHelper";
import AlgoPainterGweiItemProxy from "@/lib/eth/AlgoPainterGweiItemProxy";
import RoboHashAddress from "@/lib/components/ui/RoboHashAddress.vue";
import TokenAmount from "@/lib/components/ui/TokenAmount.vue";
import TransactionLink from "@/lib/components/ui/TransactionLink.vue";

import MarkButton from "@/lib/components/ui/MarkButton";

export default {
  components: {
    RoboHashAddress,
    TokenAmount,
    TransactionLink,
    MarkButton,
  },

  data() {
    return {
      page: 1,
      pageCount: 0,
      pageSize: 8,
      proposals: [],
      voteDialog: false,
      selectedProposal: {},
      selectedContent: {},

      currentBlockNumber: 0,

      loading: true,

      stats: [
        {
          star: 1,
          color: "success",
          title: "Proposals",
          value: "0",
        },
        {
          star: 2,
          color: "grey",
          title: "Finished",
          value: "0",
        },
        {
          star: 3,
          color: "yellow",
          title: "Burnt Tokens",
          value: "0",
        },
      ],
    };
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    markedProposals() {
      return this.$store.getters["user/markedProposals"];
    },
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    page() {
      this.loadProposals();
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    goToProposal(proposalId) {
      this.$router.push(`/robots/${proposalId}`);
    },

    goToNew() {
      this.$router.push(`/paitings/new`);
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      this.loading = true;

      const proxy = new AlgoPainterGweiItemProxy();

      var count = await proxy.balanceOf(this.account);

      const tokenIdsPromises = [];

      for (let i = 0; i < count; i++) {
        tokenIdsPromises.push(proxy.tokenOfOwnerByIndex(this.account, i));
      }

      const tokenIds = await Promise.all(tokenIdsPromises);
      console.log(tokenIdsPromises);
      console.log(tokenIds);
      const tokensURIs = await Promise.all(tokenIds.map(tokenId => proxy.tokenURI(tokenId)));
      const tokens = await Promise.all(tokensURIs.map(uri => {
        const data = uri.split('/');
        return IPFSHelper.read(data[data.length - 1]);
      }));
      console.log(tokens);

      console.log(`count ${count}`);

      this.loading = false;

    },
  },
};
</script>
