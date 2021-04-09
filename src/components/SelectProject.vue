<template>

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
        Selectionner un projet
      </v-card-title>
      <v-container fluid>
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            lg="6"
          >
            <v-select
              label="Sélectionner votre projet"
              :items="listOfProjects.map(project=>project.nom)"
              v-model="selectedProject"
              @change="changeProject()"
            ></v-select>
          </v-col>
          <v-col
            cols="12"
            md="8"
            lg="6"
          >
            <v-text-field
              label="Entrez l'url google sheet pour ce projet"
              :rules="urlRules"
              v-model="urlSheet"
              @change="isEdited=true"
            ></v-text-field>
            <v-text-field
              label="Entrez l'url google docs du template pour ce projet"
              :rules="urlRules"
              v-model="urlTemplate"
              @change="isEdited=true"
            ></v-text-field>
                <v-text-field
              label="Entrez l'url google docs du template pour le programme global"
              :rules="urlRules"
              v-model="urlTemplateGlobal"
              @change="isEdited=true"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
      <v-row>
        <v-col
          justify="center"
          align="center"
        >
          <v-btn
            @click="selectProject()"
            color="success"
          >Valider</v-btn>

        </v-col>

      </v-row>

    </v-card>
    <v-overlay :value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-form>

</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data: () => ({
    loading: false,
    alertType: 'success',
    alertValue: false,
    alertMessage: '',
    selectedProject: null,
    urlSheet: '',
    urlTemplate: '',
    urlTemplateGlobal: '',
    isEdited: false,
    urlRules: [
      v => /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(v) || 'URL doit être valide'
    ]
  }),
  methods: {
    ...mapActions([
      'setSheetId',
      'setData',
      'setSelectedProject'
    ]),

    changeProject () {
      this.isEdited = false
      this.urlSheet = null
      this.urlTemplate = null
      if (this.selectedProject != null) {
        const project = this.listOfProjects.find(project => project.nom === this.selectedProject)
        // on recale une url correcte pour l'affichage
        if (project.sheetId) {
          this.urlSheet = `https://docs.google.com/spreadsheets/d/${project.sheetId}/edit#gid=123`
        }
        if (project.templateId) {
          this.urlTemplate = `https://docs.google.com/document/d/${project.templateId}/edit#gid=123`
        }
        if (project.templateGlobalId) {
          this.urlTemplateGlobal = `https://docs.google.com/document/d/${project.templateGlobalId}/edit#gid=123`
        }
      }
    },
    async selectProject () {
      if (this.$refs.sheetForm.validate()) {
        this.loading = true
        let project = this.listOfProjects.find(project => project.nom === this.selectedProject)
        if (this.isEdited) {
          const index = this.listOfProjects.findIndex(project => project.nom === this.selectedProject)
          project.sheetId = this.urlSheet.split('/')[5]
          project.templateId = this.urlTemplate.split('/')[5]
          project.templateGlobalId = this.urlTemplateGlobal.split('/')[5]
          this.listOfProjects[index] = project
        }
        this.setSelectedProject(project)
        try {
          await this.setData()
          this.alertType = 'success'
          this.alertMessage = 'Projet chargé ! Redirection vers les formations'
          this.alertValue = true
          setTimeout(() => this.$router.push({ name: 'formations' }), 2000)
        } catch (error) {
          this.alertMessage = error
          this.alertType = 'error'
          this.alertValue = true
        }
      }
      this.loading = false
      this.isEdited = false
    }

  },
  computed: {
    ...mapGetters([
      'listOfProjects'
    ])
  }
}
</script>
