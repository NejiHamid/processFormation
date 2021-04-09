<template>
  <v-app>
    <v-app-bar
      app
      hide-on-scroll
      color="indigo"
      dark
      clipped-left
    >
      <v-btn
        icon
        @click.stop="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="headline text-uppercase">
        <span>FormaMIAGE </span>
        <span></span>
        <span
          v-if="currentVersion"
          class="caption font-weight-light"
        >v<span class="title">{{currentVersion}}</span></span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <span>{{currentProject.nom}} </span>
      <v-spacer></v-spacer>

      <v-btn
        @click="logOut"
        v-if="isSignIn"
      >
        <span class="mr-2">Déconnexion</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      clipped
      v-model="drawer"
      v-if="isSignIn"
    >
      <v-list-item>
        <v-list-item-avatar v-show="isSignIn">
          <v-icon>mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-title>{{currentUser.fullName}}</v-list-item-title>
        <v-btn
          icon
          @click.stop="drawer = !drawer"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to="item.link"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer
      dark
      padless
    >
      <v-card
        flat
        tile
        class="indigo lighten-1 white--text text-center"
        width="100%"
      >
        <v-card-text>
          <v-btn
            v-for="icon in icons"
            :key="icon"
            class="mx-4 white--text"
            icon
          >
            <v-icon size="24px">{{ icon }}</v-icon>
          </v-btn>
        </v-card-text>

        <v-card-text class="white--text pt-0">
          Solution de gestion de formations basé sur g-suite
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text class="white--text">
          2020 — <strong>FORMAMIAGE</strong> <a to="privacy-policy" target="_blank">Conditions d'utilisation</a>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'App',
  data: () => ({
    drawer: false,
    items: [
      { title: 'Mon projet', icon: 'mdi-home', link: '/home' },
      { title: 'Formations', icon: 'mdi-view-list', link: '/formations' },
      { title: 'Ajouter un projet', icon: 'mdi-google-spreadsheet', link: 'new-project' },
      { title: 'Configurer du projet', icon: 'mdi-wrench', link: 'config' },
      { title: 'Configuration du template', icon: 'mdi-file-document-edit', link: 'template' },
      { title: 'Configuration du template global', icon: 'mdi-file-document-edit', link: 'templateGlobal' },
      { title: 'Condition d\'utilisation', icon: 'mdi-checkbox-marked-circle', link: 'privacy-policy' }
    ],
    icons: [
      'mdi-facebook',
      'mdi-twitter',
      'mdi-google-plus',
      'mdi-linkedin',
      'mdi-instagram'
    ]
    //
  }),
  methods: {
    ...mapActions([
      'setUser'
    ]),
    logOut () {
      this.setUser({
        fullName: ''
      })
      this.$router.replace('login')
    }
  },
  computed: {
    ...mapGetters([
      'currentUser',
      'currentVersion',
      'isSignIn',
      'currentProject'
    ])
  }
}
</script>
