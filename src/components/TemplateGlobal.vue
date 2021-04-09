<template>
  <v-container fluid>
    <v-row>
      <h1>Configuration du template GDOCS</h1>
      <v-spacer></v-spacer>
      <v-btn
        class="mx-2  right"
        fab
        @click="loadGdocsContent"
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
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-form ref="template">
      <v-alert
        :type="alertType"
        :value="alertValue"
        dismissible
      >
        {{alertMessage}}
      </v-alert>
      <v-row
        v-for="(item,index) in valuesToReplace"
        :key="index"
      >
        <v-col>
          <v-card>
            <v-card-title primary-title>
              {{item.key}}
            </v-card-title>
            <v-row>
              <v-col>
                <v-select
                  :items="sheets"
                  v-model="item.sheet"
                  label="Nom de la Feuille"
                  :rules="rules"
                ></v-select>
              </v-col>
              <v-col v-if="item.sheet === currentMapping.nameSheetDetailsFormation">
                <v-select
                  :items="Object.keys(getValuesGroupByColumns(item.sheet,currentMapping.nameColumnGroupByDetailFormation))"
                  v-model="item.field"
                  :label="currentMapping.nameColumnGroupByDetailFormation"
                  :rules="rules"
                ></v-select>
                <v-row
                  v-for=" (v,i) in item.values"
                  :key="i"
                >
                  <v-col>
                    <v-select
                      :items="getColumnsForSheet(item.sheet)"
                      v-model="item.values[i]"
                      label="label"
                      :rules="rules"
                    ></v-select>

                  </v-col>
                  <v-col>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          v-on="on"
                          @click="item.values.splice(i,1)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <span>supprimer</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      v-on="on"
                      @click="item.values.push('')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>Ajouter un champs</span>
                </v-tooltip>

              </v-col>
              <v-col v-else>
                <v-select
                  :items="getColumnsForSheet(item.sheet)"
                  v-model="item.field"
                  label="Nom de la colonne"
                  :rules="rules"
                ></v-select>
              </v-col>
            </v-row>
          </v-card>

        </v-col>

      </v-row>
    </v-form>
    <v-row>
      <v-col
        justify="center"
        align="center"
      >
        <v-btn
          @click="setNewMapping"
          color="success"
        >Valider</v-btn>

      </v-col>
    </v-row>

  </v-container>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    alertType: 'success',
    alertMessage: '',
    alertValue: false,
    loading: false,
    sheets: [],
    pattern: /{{[^{]*}}/gm,
    valuesToReplace: [],
    rules: [
      v => !!v || 'champs obligatoire'
    ]
  }),
  async mounted () {
    this.sheets.push(this.currentMappingGlobal.nameSheetDetailsFormation, this.currentMappingGlobal.nameSheetFicheFormation)
    this.loadGdocsContent()
  },
  methods: {
    ...mapActions([
      'setTemplate'
    ]),
    async loadGdocsContent () {
      this.loading = true
      try {
        await this.fetchDataToBeReplaced()
        this.alertType = 'success'
        this.alertMessage = 'Template G-docs parsé !'
        this.alertValue = true
      } catch (error) {
        this.alertType = 'error'
        this.alertMessage = error
        this.alertValue = true
      }
      this.loading = false
    },
    async fetchDataToBeReplaced () {
      const docContent = await this.$gapi.gdocs.fetchAlltext(this.currentProject.templateGlobalId)
      console.log(docContent)
      this.valuesToReplace = docContent.match(this.pattern).map(v => {
        const obj = {}
        obj.key = v
        if (this.currentTemplateGlobal[v] !== undefined) {
          const splited = this.currentTemplateGlobal[v].split('.')
          obj.sheet = splited[0]
          if (obj.sheet === this.currentMappingGlobal.nameSheetFicheFormation) {
            obj.field = JSON.parse(splited[2])
          } else {
            obj.field = splited[1]
            obj.values = JSON.parse(splited[2])
          }
        } else {
          obj.sheet = this.currentMappingGlobal.nameSheetFicheFormation
          obj.field = ''
          obj.values = []
        }
        return obj
      })
    },
    setNewMapping () {
      if (this.$refs.templateGlobal.validate()) {
        this.setTemplate(this.newTemplate)
        this.alertType = 'success'
        this.alertMessage = 'Nouveau template enregistré'
        this.alertValue = true
        window.scrollTo(0, 0)
      }
    },
    getFieldsFromDetailsFicheFormation (sheetName, columnName, field) {
      const grouped = this.getValuesGroupByColumns(sheetName, columnName)
      let values = []
      try {
        values = grouped[field][0]
        values = Object.keys(values)
      } catch (error) {
      }
      return values
    }
  },
  computed: {
    ...mapGetters([
      'currentMappingGlobal',
      'currentProject',
      'currentTemplateGlobal',
      'getColumnsForSheet',
      'getValuesGroupByColumns'
    ]),
    newTemplate () {
      return this.valuesToReplace.reduce((acc, obj) => {
        acc[obj.key] = obj.sheet === this.currentMappingGlobal.nameSheetFicheFormation ? `${obj.sheet}.0."${obj.field}"` : `${obj.sheet}.${obj.field}.${JSON.stringify(obj.values)}`
        return acc
      }, {})
    }
  }
}
</script>
