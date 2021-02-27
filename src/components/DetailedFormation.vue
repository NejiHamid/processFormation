<template>
  <div>
    <v-snackbar
      :value="resultSuccess"
      :timeout="0"
      center
      vertical
      top
      :color="resultColor"
    >
      <span>
        {{ resultText }}
      </span>

    </v-snackbar>
    <v-btn
      color="primary"
      @click="$router.go(-1)"
    >
      <v-icon>mdi-chevron-left</v-icon> Retour au formations
    </v-btn>
    <v-row
      align="center"
      class="ma-2"
    >
      <h1>Détail fiche de formation</h1>
      <v-spacer></v-spacer>
      <v-btn
        color="green darken-2 white--text"
        large
        @click="showAddLineDialog()"
      >
        Ajouter une ligne
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        v-for="(feuille,keyFeuille,indexFeuille) in formationItem"
        :key="`${keyFeuille+indexFeuille}-feuille`"
      >
        <v-row dense>
          <v-col
            cols="12"
            :key="`${keyFeuille+keyValues+indexValues}-values`"
            v-for="(values,keyValues,indexValues) in feuille"
          >
            <v-card color="grey lighten-1">
              <v-container fluid>
                <v-card-title
                  primary-title
                  v-if="isNaN(keyValues)"
                >
                  {{keyValues}}
                </v-card-title>

                <v-row row="12">
                  <v-col
                    :key="`${keyFeuille+keyValues+keyLine+indexLine}-line`"
                    v-for="(line,keyLine,indexLine) in values"
                    cols="12"
                  >
                    <v-card>
                      <v-container fluid>

                        <div class="text-right">
                          <v-btn
                            v-if="isNaN(keyValues)"
                            color="red darken-1 white--text"
                            fab
                            small
                            class="mb-3"
                            @click="prepareDeleteLine(keyFeuille,line)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>

                        <v-row
                          dense
                          row="12"
                        >
                          <v-col
                            cols="12"
                            sm="12"
                            lg="4"
                            md="6"
                            :key="`${keyFeuille+keyValues+keyLine+keytext+indexText}-line`"
                            v-for="(text,keytext,indexText) in $_.omit(line,'pk')"
                            ma-2
                            v-show="!detailFormationMapping.hideColumns.includes(keytext)"
                          >
                            <v-text-field
                              v-if="!detailFormationMapping.buttonsSelect.hasOwnProperty(keytext)"
                              :label="keytext"
                              :value="text"
                              v-model="formationItem[keyFeuille][keyValues][keyLine][keytext]"
                              outlined
                              @keydown="isEdited=true"
                              :hide-details="true"
                            >
                            </v-text-field>
                            <v-select
                              v-else
                              :items="detailFormationMapping.buttonsSelect[keytext]"
                              item-text="label"
                              item-value="value"
                              v-model="formationItem[keyFeuille][keyValues][keyLine][keytext]"
                              outlined
                              :label="keytext"
                              @change="isEdited=true"
                              :hide-details="true"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-snackbar
      :value="isEdited && !loading"
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
      <div
        v-show="!minimizeAction"
        class=""
      >
        <v-btn
          color="red"
          text
          @click="abort"
        >
          Annuler tout
        </v-btn>
        <v-btn
          color="green"
          text
          @click="save"
        >
          Sauvegarder
        </v-btn>
      </div>
    </v-snackbar>
    <!-- modification en cours loader -->
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <v-dialog
      v-model="confirmDeleteDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">Voulez-vous vraiment supprimer cet élément ?</v-card-title>
        <v-card-text>Les données modifiés, seront également enregistrées. <strong>Cette action est irréversible !</strong></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="confirmDeleteLine"
          >Supprimer
          </v-btn>
          <v-btn
            color="green lighten-1 white--text"
            @click="abortDeleteLine"
          >Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="addLineDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">Ajout d'un élement</v-card-title>
        <v-card-text>
          <v-row
            dense
            row="12"
          >
            <v-select
              :items="listOfSheets"
              v-model="addSheetSelected"
              @change="prepareLineToAdd"
            ></v-select>
            <v-col
              cols="12"
              sm="12"
              lg="4"
              md="6"
              :key="`${keyValueOfElement}-addLine`"
              v-for="(newValueOfElement,keyValueOfElement) in lineToAdd"
              ma-2
            >
              <v-text-field
                :label="keyValueOfElement"
                :value="newValueOfElement"
                v-model="lineToAdd[keyValueOfElement]"
                :readonly="columnsToComplete.columns.find(v => v === keyValueOfElement) !==undefined"
                outlined
                :hide-details="true"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="addLineDialog=false"
          >Annuler
          </v-btn>
          <v-btn
            color="green lighten-1 white--text"
            @click="confirmAddLine()"
          >Ajouter</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    actionText: 'Des modifications ont été apportées, Que souhaitez-vous faire ? ',
    minimizeAction: false,
    loading: false,
    isEdited: false,
    formationBackup: null,
    formationItem: null,
    dataItem: null,
    confirmDeleteDialog: false,
    deleteKeyFeuille: null,
    deleteLine: null,
    resultSuccess: false,
    resultText: '',
    resultColor: 'red lighten-2',
    lineToAdd: {},
    addLineDialog: false,
    addSheetSelected: '',
    timeOutSnackSuccess: 5000,
    timer: null
  }),
  mounted () {
    // une copie de l'objet pour un retour arrière
    this.formationItem = this.formation
    this.formationBackup = JSON.parse(JSON.stringify(this.formationItem))
    this.dataItem = JSON.parse(JSON.stringify(this.currentData))
    // this.dataBackup = JSON.parse(JSON.stringify(this.currentData))
    window.scrollTo(0, 0)
    // un passage par réference
  },
  methods: {
    minimize () {
      this.minimizeAction = !this.minimizeAction
    },
    showResultText (text, color) {
      this.timer = window.clearTimeout(this.timer)
      this.resultText = text
      this.resultColor = color
      this.resultSuccess = true
      this.timer = window.setTimeout(() => { this.resultSuccess = false }, this.timeOutSnackSuccess)
    },
    prepareLineToAdd () {
      this.lineToAdd = {}
      this.listOfFields.forEach(element => {
        if (this.columnsToComplete.columns.find(value => value === element)) {
          this.lineToAdd[element] = this.formation[this.mapping.columnsToComplete.sheet][0][0][element]
        } else {
          this.lineToAdd[element] = ''
        }
      })
    },
    // afficher la boite de dialog
    showAddLineDialog () {
      this.addLineDialog = true
    },
    async confirmAddLine () {
      this.loading = false
      this.addLineDialog = false
      const payload = { sheetName: this.addSheetSelected, value: this.lineToAdd }
      // suavegarde
      try {
        this.loading = true
        await this.addToData(payload)
        this.isEdited = false
        this.loading = false
        this.showResultText('Les données ont été enregistrés. ✔️', 'green lighten-1')
        this.addSheetSelected = ''
        this.lineToAdd = {}// reset
        // update de l'affichage
        this.formationItem = this.formation
        this.formationBackup = JSON.parse(JSON.stringify(this.formationItem))
      } catch (error) {
        this.loading = false
        this.showResultText(`❌ Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.`, 'red lighten-1')
      } finally {
        this.loading = false
      }
    },
    // abandonner
    abort () {
      this.formationItem = JSON.parse(JSON.stringify(this.formationBackup))
      this.isEdited = false
    },
    prepareDeleteLine (keyFeuille, line) {
      this.deleteKeyFeuille = keyFeuille
      this.deleteLine = line
      this.confirmDeleteDialog = true
    },
    abortDeleteLine () {
      this.confirmDeleteDialog = false
      this.deleteKeyFeuille = null
      this.deleteLine = null
    },
    async confirmDeleteLine () {
      // let index = this.dataItem[this.deleteKeyFeuille].findIndex((element) => this.$_.isEqual(element, this.deleteLine))
      this.loading = false
      this.confirmDeleteDialog = false

      const lineToDelete = { sheetName: this.deleteKeyFeuille, pk: this.deleteLine.pk }
      try {
        this.loading = true
        await this.deleteFromData(lineToDelete)
        this.isEdited = false
        this.loading = false
        this.showResultText('Les données ont été enregistrés. ✔️', 'green lighten-1')
      } catch (error) {
        this.loading = false
        this.showResultText(`❌ Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.`, 'red lighten-1')
      } finally {
        this.loading = false
      }
      this.deleteKeyFeuille = null// reset
      this.deleteLine = null // reset

      // update de l'affichage
      this.formationItem = this.formation
      this.formationBackup = JSON.parse(JSON.stringify(this.formationItem))
    },
    async save () {
      this.loading = true
      try {
        await this.writeToSheet()
        this.isEdited = false
        this.loading = false
        this.showResultText('Les données ont été enregistrés. ✔️', 'green lighten-1')
        this.$forceUpdate()
      } catch (error) {
        this.loading = false
        this.showResultText(`❌ Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.`, 'red lighten-1')
      }
    },
    ...mapActions([
      'deleteFromData',
      'addToData',
      'writeToSheet',
      'writeData',
      'formationStringify'
    ])
  },
  computed: {
    ...mapGetters({
      currentFormation: 'currentFormation',
      currentData: 'currentData',
      mapping: 'currentMapping',
      fieldsBySheetName: 'getFieldsBySheetName',
      detailFormationMapping: 'currentDetailFormationMapping'
    }),
    columnsToComplete () {
      return this.mapping.columnsToComplete
    },
    listOfSheets () {
      let sheets = Object.keys(this.fieldsBySheetName)
      let index = sheets.indexOf(this.columnsToComplete.sheet)
      if (index > -1) {
        sheets.splice(index, 1)
      }
      return sheets
    },
    listOfFields () {
      if (this.$_.isEmpty(this.addSheetSelected)) {
        return {}
      } else {
        return Object.keys(this.$_.omit(this.fieldsBySheetName[this.addSheetSelected], 'pk'))
      }
    },
    formation () {
      return this.currentFormation(this.$route.params.formation)
    }
  }
}
</script>
<style scoped>
</style>
