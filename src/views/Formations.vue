<template>
  <v-container fluid>
    <v-row>
      <h1>Les formations</h1>
      <v-spacer></v-spacer>
      <v-btn
        class="mx-2  right"
        fab
        @click="loadFormations"
        color="secondary"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon
          dark
          large
        >mdi-refresh</v-icon>
      </v-btn>
    </v-row>
    <v-row>
      <v-col>
        <v-alert
          dismissible
          :type="alert.type"
          :value="alert.show"
        >
          {{alert.message}}

        </v-alert>

      </v-col>

    </v-row>
    <v-row class="bottom-space">
      <v-col
        cols="12"
        xs="12"
        lg="6"
        :key="index"
        v-for="(formation,key,index) in formations"
      >
        <v-card
          height="100%"
          :elevation="check.indexOf(key)!== -1 ? 0 : 24"
          :outlined="check.indexOf(key)!== -1 ? true : false"
          :class="{'green lighten-5': check.indexOf(key)!== -1}"
          @click.stop="checkFormation({index : key, value :formation[currentNameColumnJoinWithSheetDetailsFormation]})"
        >
          <v-checkbox
            v-model="check"
            class="mx-2 float-right"
            :value="key"
            multiple
            @click="checkFormation({index : key, value :formation[currentNameColumnJoinWithSheetDetailsFormation]})"
            color="success"
          ></v-checkbox>
          <v-card-title primary-title>

            {{formation['Libelle de fiche de formation']}}

          </v-card-title>
          <v-card-subtitle>
            <div
              :key="(key+index)"
              v-for="(value,key,index) in $_.omit(formation,'pk') "
            >
              <span v-if="(value!=='')"><strong>{{key}}:</strong> : {{value}}</span>
            </div>
          </v-card-subtitle>
          <v-card-actions
            class="secondary"
            fixed
          >
            <v-btn
              color="success"
              tile
              :to="{ name: 'detailFormation', params: { formation: formation[currentNameColumnJoinWithSheetDetailsFormation]} }"
            >Consulter <v-icon>mdi-eye</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar
      :value="formationSelected && !showMailDialog && !loading"
      vertical
      :timeout="0"
      right
    >
      <span class="ver">
        <v-icon
          color="white"
          @click="minimize"
          v-if="minimizeAction"
          class="minimize-icon"
        >mdi-chevron-double-up</v-icon>
        <v-icon
          color="white"
          @click="minimize"
          v-else
          class="minimize-icon"
        >mdi-chevron-double-down</v-icon>{{ actionText }}
      </span>

      <div v-show="!minimizeAction">
        <v-btn
          color="yellow"
          text
          @click="showMailDialog=true"
        >
          Envoyer par mail
        </v-btn>
        <v-btn
          color="blue"
          text
          @click="download"
        >
          Télécharger
        </v-btn>
        <v-btn
          color="red"
          text
          @click="uncheckAllFormations"
        >
          Tout décocher
        </v-btn>
        <v-btn
          color="green"
          text
          @click="checkAllFormations"
        >
          Tout Cocher
        </v-btn>
      </div>

    </v-snackbar>
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-dialog
      v-model="showMailDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="headline">Envoyer un mail</v-card-title>
        <v-card-text>
          <v-form ref="sendMail">
            <v-row
              dense
              row="12"
            >

              <v-col
                cols="12"
                ma-2
              >
                <v-combobox
                  v-model="chipsMail"
                  chips
                  counter
                  clearable
                  label="email"
                  multiple
                  solo
                >
                  <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="removeEmail(item)"
                    >
                      <strong>{{item}}</strong>&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col>
              <v-col
                cols="12"
                ma-2
              >
                <v-text-field
                  label="Objet"
                  v-model="subject"
                  outlined
                  required
                >
                </v-text-field>
              </v-col>
              <v-col
                cols="12"
                ma-2
              >
                <v-textarea
                  label="Corps du message"
                  v-model="body"
                  required
                >
                </v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="showMailDialog=false"
          >Annuler
          </v-btn>
          <v-btn
            v-if="!mailEmpty"
            color="green lighten-1 white--text"
            @click="sendByEmail"
          >Envoyer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import PdfGenerator from '@/customClasses/pdfGenerator'

export default {
  data: () => ({
    error: null,
    alert: {
      show: false,
      message: '',
      type: 'success'
    },
    check: [], // key des formations cochés
    loading: false,
    actionText: 'Que souhaitez-vous faire ?',
    minimizeAction: false,
    subject: '',
    body: '',
    showMailDialog: false,
    chipsMail: [],
    selectedFormations: []
  }),
  computed: {
    ...mapGetters([
      'currentSheetId',
      'currentData',
      'isSignIn',
      'currentNameColumnJoinWithSheetDetailsFormation',
      'currentTemplate',
      'currentFormation',
      'currentGdocsTemplate',
      'currentMapping'
    ]),
    mailEmpty () {
      return this.$_.isEmpty(this.chipsMail)
    },
    formationSelected () {
      return this.check.length
    },
    formations () {
      let list = []

      if (Object.keys(this.currentData).length) {
        list = this.currentData['Fiches de formations']
      }
      return list
    }
  },
  watch: {
    check: function (newCheck) {
      // ouverture des actions si première formation ouverte
      if (!newCheck.length) this.minimizeAction = false
    },
    formations () {
      this.loading = false
    }
  },
  methods: {
    ...mapActions([
      'setUser',
      'setData'
    ]),
    clearMail () {
      this.chipsMail = []
      this.body = ''
      this.subject = ''
      this.showMailDialog = false
    },
    removeEmail (item) {
      this.chipsMail.splice(this.chipsMail.indexOf(item), 1)
      this.chipsMail = [...this.chipsMail]
    },
    download () {
      if (this.selectedFormations.length > 0) {
        this.loading = true
        const promises = []
        this.selectedFormations.forEach(value => {
          const formation = this.currentFormation(value)
          const pdfgen = new PdfGenerator(this.$gapi, this.currentGdocsTemplate, this.currentTemplate, formation, `${value}.pdf`, 'pdf')
          promises.push(pdfgen.generatePdf())
        })
        Promise.all(promises).then(
          () => {
            this.alert.message = 'Le téléchargement de vos fichiers va commencer dans un instant ..'
            this.alert.show = true
            this.alert.type = 'success'
            this.loading = false
            this.check = []
          }
        ).catch(err => {
          this.alert.message = err
          this.alert.show = true
          this.loading = false
          this.alert.type = 'error'
          this.check = []
        })
      } else {
        this.alert.message = 'Vous devez selectionner au moins une formation'
        this.alert.show = true
        this.alert.type = 'warning'
      }
    },
    existValidMail () {
      let result = false
      this.chipsMail.forEach(mail => {
        // eslint-disable-next-line
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
          result = true
        }
      })
      return result
    },
    sendByEmail () {
      if (this.selectedFormations.length > 0) {
        if (this.existValidMail()) {
          this.showMailDialog = false
          this.loading = true
          const promises = []
          this.selectedFormations.forEach(value => {
            const formation = this.currentFormation(value)
            this.chipsMail.forEach(mail => {
              // eslint-disable-next-line
              if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
                let objet = formation[this.currentMapping.labelFicheFormation.sheet][0][0][this.currentMapping.labelFicheFormation.column] + ' | ' + this.subject
                const pdfgen = new PdfGenerator(this.$gapi, this.currentGdocsTemplate, this.currentTemplate, formation, `${value}.pdf`, 'email', [{ adress: mail, message: this.body, objet: objet }])
                promises.push(pdfgen.generatePdf())
              }
            })
          })
          Promise.all(promises).then(
            () => {
              this.alert.message = 'Mails envoyés'
              this.alert.show = true
              this.alert.type = 'success'
              this.loading = false
              this.chipsMail = []
              this.body = ''
              this.subject = ''
              this.check = []
            }
          ).catch(err => {
            this.chipsMail = []
            this.body = ''
            this.subject = ''
            this.alert.message = err
            this.alert.show = true
            this.loading = false
            this.alert.type = 'error'
            this.check = []
          })
        } else {
          this.alert.message = 'Vous devez saisir une adresse mail valide'
          this.alert.show = true
          this.alert.type = 'warning'
        }
      } else {
        this.alert.message = 'Vous devez selectionner au moins une formation'
        this.alert.show = true
        this.alert.type = 'warning'
      }
    },
    minimize () {
      this.minimizeAction = !this.minimizeAction
    },
    checkFormation ({ index, value }) {
      if (this.check.includes(index)) {
        this.selectedFormations.splice(this.check.indexOf(index), 1)
        this.check.splice(this.check.indexOf(index), 1)
      } else {
        this.check.push(index)
        this.selectedFormations.push(value)
      }
    },
    uncheckAllFormations () {
      this.check = []
      this.selectedFormations = []
    },
    checkAllFormations () {
      this.check = []
      this.formations.forEach((element, index) => {
        this.check.push(index)
        this.selectedFormations.push(element)
      })
    },
    isActive (key) {
      return this.check.includes(key)
    },
    async loadFormations () {
      this.loading = true
      await this.setData()
      this.loading = false
    }
  }
}
</script>

<style scoped>
.minimize-icon {
  padding: 5px;
}
.bottom-space {
  margin-bottom: 50px;
}
</style>
