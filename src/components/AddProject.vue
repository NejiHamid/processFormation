<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              :complete="e1 > 1"
              step="1"
            >Information nouveau projet</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step
              :complete="e1 > 2"
              step="2"
            >Configuration nouveau projet</v-stepper-step>
          </v-stepper-header>
          <v-row>
            <v-col>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-form ref="sheetForm">
                    <v-alert
                      :type="alertType"
                      :value="alertValue"
                      dismissible
                    >
                      {{alertMessage}}
                    </v-alert>
                    <v-card>
                      <v-card-title primary-title>
                        Renseigner la feuille
                      </v-card-title>
                      <v-row>
                        <v-col>
                          <v-text-field
                            label="Nom du projet"
                            :rules="[v => !!v || 'Nom du projet obligatoire']"
                            v-model="projectName"
                          ></v-text-field>
                          <v-text-field
                            label="Entrez l'url google sheet"
                            :rules="urlRules"
                            v-model="sheetUrl"
                          ></v-text-field>
                          <v-text-field
                            label="Entrez l'url google docs du template pour ce projet"
                            :rules="urlRules"
                            v-model="templateUrl"
                          ></v-text-field>
                                       <v-text-field
                            label="Entrez l'url google docs du template pour le programme global"
                            :rules="urlRules"
                            v-model="templateGlobalUrl"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-form>
                  <v-btn
                    color="primary"
                    @click="registerNewProject"
                  >
                    Passer à la configuration
                  </v-btn>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <v-card
                    class="mb-12"
                    color="grey lighten-1"
                  >
                    <Configuration>
                    </Configuration>
                  </v-card>
                </v-stepper-content>
              </v-stepper-items>

            </v-col>
          </v-row>

        </v-stepper>

      </v-col>
    </v-row>

  </v-container>

</template>
<script>
import { mapActions } from 'vuex'
import Configuration from '@/components/Configuration'
export default {
  components: {
    Configuration
  },
  data: () => ({
    e1: 1,
    alertType: 'success',
    alertMessage: '',
    templateUrl: '',
    templateGlobalUrl: '',
    projectName: null,
    sheetUrl: null,
    alertValue: false,
    urlRules: [
      v => /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(v) || 'URL doit être valide'
    ]
  }),
  methods: {
    ...mapActions([
      'addNewproject'
    ]),
    registerNewProject () {
      if (this.$refs.sheetForm.validate()) {
        const sheetId = this.sheetUrl.split('/')[5]
        const templateId = this.templateUrl.split('/')[5]
        const templateGlobalId = this.templateGlobalUrl.split('/')[5]
        try {
          this.addNewproject({
            nom: this.projectName,
            sheetId: sheetId,
            templateId: templateId,
            templateGlobalId: templateGlobalId
          })
          this.alertType = 'success'
          this.alertMessage = 'Nouveau projet ajouté avec succès !'
          this.e1 = 2
        } catch (error) {
          this.alertType = 'error'
          this.alertMessage = error
        }

        this.alertValue = !this.alertValue
      }
    }
  }
}
</script>
