<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title primary-title>
            Bienvenue
          </v-card-title>
          <v-card-text>
              Pour utiliser l'application vous devez vous connecter avec un compte google et authoriser certaines actions.
              Ces autorisations permettrons d'acceder au formations,de les modifier, les télécharger et de pouvoir envoyer les formations par e-mail.
          </v-card-text>
          <v-card-actions>
            <v-row>
              <v-col
                justify="center"
                align="center"
              >
                <v-btn
                  @click="signIn"
                  color="pink"
                  dark

                >
                  Je me connecte
                  <v-icon>mdi-account</v-icon>
                </v-btn>

              </v-col>
            </v-row>

          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data: () => ({

  }),
  methods: {
    ...mapActions([
      'setUser'
    ]),
    signIn () {
      const authInstance = this.$gapi.gapi.auth2.getAuthInstance()
      authInstance.signIn().then(
        () => {
          const user = {}
          const profile = authInstance.currentUser.get().getBasicProfile()
          user.fullName = profile.getName()
          user.email = profile.getEmail()
          this.setUser(user)
          this.$router.push('/home')
        }
      )
    }
  }
}
</script>
