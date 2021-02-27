<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-form ref="confForm" lazy-validation>
          <v-alert
            :type="alertType"
            :value="alertValue"
            dismissible
          >
            {{alertMessage}}
          </v-alert>
          <v-row>
            <v-col>
              <v-card>
                <v-card-title primary-title>
                  Configuration du projet
                </v-card-title>
                <v-text-field
                  class="pa-5"
                  label="Nom de la feuille contenant les formations"
                  :rules="[v => !!v || 'champs obligatoire']"
                  v-model="mapping.nameSheetFicheFormation"
                  :placeholder="currentMapping.nameSheetFicheFormation"
                ></v-text-field>
                <v-text-field
                  class="pa-5"
                  label="Nom de la feuille contenant le détail des formations"
                  :rules="[v => !!v || 'champs obligatoire']"
                  :placeholder="currentMapping.nameSheetDetailsFormation"
                  v-model="mapping.nameSheetDetailsFormation"
                ></v-text-field>
                <v-text-field
                  class="pa-5"
                  label="Nom de la colonne sur laquel effectuer la jointure des deux feuilles"
                  :rules="[v => !!v || 'champs obligatoire']"
                  v-model="mapping.nameColumnJoinWithSheetDetailsFormation"
                  :placeholder="currentMapping.nameColumnJoinWithSheetDetailsFormation"
                ></v-text-field>
                <v-text-field
                  class="pa-5"
                  label="Nom du champs de la colonne sur laquel effectuer un regroupement"
                  :rules="[v => !!v || 'champs obligatoire']"
                  :placeholder="currentMapping.nameColumnGroupByDetailFormation"
                  v-model="mapping.nameColumnGroupByDetailFormation"
                ></v-text-field>
              </v-card>

            </v-col>

          </v-row>
          <v-row>
            <v-col>
              <v-card>
                <v-card-title primary-title>
                  Label Fiche de formation
                </v-card-title>
                <v-text-field
                  class="pa-5"
                  label="Feuille"
                  :rules="[v => !!v || 'champs obligatoire']"
                  :placeholder="currentMapping.labelFicheFormation.sheet"
                  v-model="mapping.labelFicheFormation.sheet"
                ></v-text-field>
                <v-text-field
                  class="pa-5"
                  label="Colonne"
                  :rules="[v => !!v || 'champs obligatoire']"
                  v-model="mapping.labelFicheFormation.column"
                  :placeholder="currentMapping.labelFicheFormation.column"
                ></v-text-field>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-card>
                <v-card-title primary-title>
                  Colonnes à compléter
                </v-card-title>
                <v-text-field
                  class="pa-5"
                  label="Nom de la feuille"
                  :rules="[v => !!v || 'champs obligatoire']"
                  v-model="mapping.columnsToComplete.sheet"
                  :placeholder="currentMapping.labelFicheFormation.sheet"
                ></v-text-field>
                <template v-for="(value,index) in mapping.columnsToComplete.columns">
                  <div
                    class="text-right"
                    :key="`delete-btn${index}`"
                  >
                    <v-btn
                      color="red darken-1 white--text"
                      fab
                      small
                      class="mb-3"
                      @click="deleteItem(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <v-text-field
                    :key="`col-complete-${index}`"
                    class="pa-5"
                    label="Nom de la colonne"
                    :rules="[v => !!v || 'champs obligatoire']"
                    v-model="mapping.columnsToComplete.columns[index]"
                    :placeholder="currentMapping.columnsToComplete.columns[index]"
                  ></v-text-field>

                </template>
                <v-card-actions
                  justify="center"
                  align="center"
                >
                  <v-col>
                    <v-btn
                      @click="addNewItem"
                      color="success"
                      fab
                      class="mb-3"
                      small
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>

                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              justify="center"
              align="center"
            >
              <v-btn
                @click="addMapping"
                color="success"
              >Valider</v-btn>
            </v-col>
          </v-row>

        </v-form>
      </v-col>
    </v-row>
    <v-row>
      <v-dialog
        v-model="dialog"
        transition="dialog-transition"
        no-gutters
      >
        <v-card width="100%">
          <v-card-title primary-title>
            Voulez vous utilisez les valeurs par défault ?
          </v-card-title>

          <v-row>
            <v-col
              justify="center"
              align="center"
            >
              <v-btn
                @click="askUser(true)"
                color="primary"
                dark
              >Oui</v-btn>
              <v-btn
                @click="askUser(false)"
                color="error"
              >Non</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  mounted () {
    this.alertType = 'warning'
    this.alertMessage = 'Assurez vous de modifier ces valeurs uniquement en cas de besoin'
    this.alertValue = true
  },
  data: () => ({
    dialog: false,
    mapping: {
      nameSheetFicheFormation: '',
      nameSheetDetailsFormation: '',
      nameColumnJoinWithSheetDetailsFormation: '',
      nameColumnGroupByDetailFormation: '',
      columnsToComplete: { sheet: '', columns: ['', '', ''] },
      labelFicheFormation: { sheet: '', column: '' }
    },
    alertType: 'success',
    alertMessage: '',
    alertValue: false
  }),
  methods: {
    ...mapActions([
      'setMapping'
    ]),
    addNewItem () {
      this.mapping.columnsToComplete.columns.push('')
    },
    deleteItem (index) {
      this.mapping.columnsToComplete.columns.splice(index, 1)
    },
    addMapping () {
      if (this.$refs.confForm.validate()) {
        this.setMapping(this.mapping)
        this.alertMessage = 'Mapping ajouté !'
        this.alertType = 'success'
        this.alertValue = true
        setTimeout(() => {
          this.alertMessage = 'redirection page selection projet'
          this.$router.push({ name: 'home' })
        }, 1000)
      } else {
        this.dialog = true
      }
    },
    askUser (response) {
      if (response) {
        this.setMapping(this.currentMapping)
        setTimeout(() => {
          this.alertValue = true
          this.alertMessage = 'redirection page selection projet'
          this.$router.push({ name: 'home' })
        }, 1000)
      }
      this.dialog = false
    }
  },
  computed: {
    ...mapGetters([
      'currentMapping'
    ])
  }

}
</script>
