<template>
  <v-container fluid>
    <v-row>
      <h1>Les indicateurs</h1>
      <v-spacer></v-spacer>
      <v-btn
        class="mx-2 right"
        fab
        @click="loadFormations"
        color="secondary"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon dark large>mdi-refresh</v-icon>
      </v-btn>
    </v-row>
    <v-row>
      <v-col>
        <v-alert dismissible :type="alert.type" :value="alert.show">
          {{ alert.message }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row class="bottom-space">
      <v-col
        cols="12"
        xs="12"
        lg="6"
        :key="index"
        v-for="(formation, key, index) in formations"
      >
        <v-card
          height="100%"
          :elevation="check.indexOf(key) !== -1 ? 0 : 24"
          :outlined="check.indexOf(key) !== -1 ? true : false"
          :class="{ 'green lighten-5': check.indexOf(key) !== -1 }"
          @click.stop="
            checkFormation({
              index: key,
              value: formation[currentNameColumnJoinWithSheetDetailsFormation],
            })
          "
        >
          <v-card-title primary-title>
            {{ formation["Libelle de fiche de formation"] }}
          </v-card-title>
            <v-card-subtitle>
            <strong class="objectif">Objectif :</strong>
          </v-card-subtitle>
          <v-card-text>
            <div
              :key="key + index"
              v-for="(value, key, index) in $_.omit(formation, 'pk')"
            >
              <span class="indicateur" v-if="key === 'Objectif'"
                > {{ value }}</span
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import PdfGenerator from "@/customClasses/pdfGenerator";

export default {
  data: () => ({
    error: null,
    alert: {
      show: false,
      message: "",
      type: "success",
    },
    check: [], // key des formations cochés
    loading: false,
    actionText: "Que souhaitez-vous faire ?",
    minimizeAction: false,
    subject: "",
    body: "",
    showMailDialog: false,
    showMailGlobalDialog : false,
    chipsMail: [],
    selectedFormations: [],
  }),
  computed: {
    ...mapGetters([
      "currentSheetId",
      "currentData",
      "isSignIn",
      "currentNameColumnJoinWithSheetDetailsFormation",
      "currentTemplate",
      "currentTemplateGlobal",
      "currentFormation",
      "currentGdocsTemplate",
      "currentGdocsTemplateGlobal",
      "currentMapping",
      "currentMappingGlobal",
    ]),
    mailEmpty() {
      return this.$_.isEmpty(this.chipsMail);
    },
    formationSelected() {
      return this.check.length;
    },
    formations() {
      let list = [];
      console.log(this.currentData);
      if (Object.keys(this.currentData).length) {
        list = this.currentData["Indicateurs"];
      }
      return list;
    },
  },
  watch: {
    check: function (newCheck) {
      // ouverture des actions si première formation ouverte
      if (!newCheck.length) this.minimizeAction = false;
    },
    formations() {
      this.loading = false;
    },
  },
  methods: {
    ...mapActions(["setUser", "setData"]),
    clearMail() {
      this.chipsMail = [];
      this.body = "";
      this.subject = "";
      this.showMailDialog = false;
    },
    removeEmail(item) {
      this.chipsMail.splice(this.chipsMail.indexOf(item), 1);
      this.chipsMail = [...this.chipsMail];
    },
    download() {
      if (this.selectedFormations.length > 0) {
        this.loading = true;
        const promises = [];
        this.selectedFormations.forEach((value) => {
          const formation = this.currentFormation(value);
          const pdfgen = new PdfGenerator(
            this.$gapi,
            this.currentGdocsTemplate,
            this.currentTemplate,
            formation,
            `${value}.pdf`,
            "pdf"
          );
          promises.push(pdfgen.generatePdf());
        });
        Promise.all(promises)
          .then(() => {
            this.alert.message =
              "Le téléchargement de vos fichiers va commencer dans un instant ..";
            this.alert.show = true;
            this.alert.type = "success";
            this.loading = false;
            this.check = [];
            this.selectedFormations=[];
          })
          .catch((err) => {
            this.alert.message = err;
            this.alert.show = true;
            this.loading = false;
            this.alert.type = "error";
            this.check = [];
            this.selectedFormations=[];

          });
      } else {
        this.alert.message = "Vous devez selectionner au moins une formation";
        this.alert.show = true;
        this.alert.type = "warning";
        this.selectedFormations=[];
      }
    
    },
    existValidMail() {
      let result = false;
      this.chipsMail.forEach((mail) => {
        // eslint-disable-next-line
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
          result = true;
        }
      });
      return result;
    },
    sendGlobalFormationsByEmail() {
      console.log("ancien", this);
      if (this.selectedFormations.length > 1) {
        if (this.existValidMail()) {
          this.showMailGlobalDialog = false;
          this.loading = true;
          const promises = [];
          let formations = [];
          this.selectedFormations.forEach((value) => {
            formations.push(this.currentFormation(value));
          });
          this.chipsMail.forEach((mail) => {
            // eslint-disable-next-line
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
              let objet = "Formation Globale"
              const pdfgen = new PdfGenerator(
                this.$gapi,
                this.currentGdocsTemplateGlobal,
                this.currentTemplateGlobal,
                formations,
                `formationGlobale.pdf`,
                "email",
                [{ adress: mail, message: this.body, objet: objet }]
              );
              promises.push(pdfgen.generatePdfGlobal(formations));
            }
          });
          Promise.all(promises)
            .then(() => {
              this.alert.message = "Mails envoyés";
              this.alert.show = true;
              this.alert.type = "success";
              this.loading = false;
              this.chipsMail = [];
              this.body = "";
              this.subject = "";
              this.check = [];
              this.selectedFormations = [];
            })
            .catch((err) => {
              this.chipsMail = [];
              this.body = "";
              this.subject = "";
              this.alert.message = err;
              this.alert.show = true;
              this.loading = false;
              this.alert.type = "error";
              this.check = [];
              this.selectedFormations = [];
            });
        } else {
          this.alert.message = "Vous devez saisir une adresse mail valide";
          this.alert.show = true;
          this.alert.type = "warning";
        }
      } else {
        this.alert.message = "Vous devez selectionner au moins deux formations.";
        this.alert.show = true;
        this.alert.type = "warning";
      }
      this.selectedFormations = [];
    },

    sendByEmail() {
      console.log(this);
      if (this.selectedFormations.length > 0) {
        if (this.existValidMail()) {
          this.showMailDialog = false;
          this.loading = true;
          const promises = [];
          this.selectedFormations.forEach((value) => {
            const formation = this.currentFormation(value);
            this.chipsMail.forEach((mail) => {
              // eslint-disable-next-line
              if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
                let objet =
                  formation[
                    this.currentMapping.labelFicheFormation.sheet
                  ][0][0][this.currentMapping.labelFicheFormation.column] +
                  " | " +
                  this.subject;
                const pdfgen = new PdfGenerator(
                  this.$gapi,
                  this.currentGdocsTemplate,
                  this.currentTemplate,
                  formation,
                  `${value}.pdf`,
                  "email",
                  [{ adress: mail, message: this.body, objet: objet }]
                );
                promises.push(pdfgen.generatePdf());
              }
            });
          });
          Promise.all(promises)
            .then(() => {
              this.alert.message = "Mails envoyés";
              this.alert.show = true;
              this.alert.type = "success";
              this.loading = false;
              this.chipsMail = [];
              this.body = "";
              this.subject = "";
              this.check = [];
              this.selectedFormations = [];

            })
            .catch((err) => {
              this.chipsMail = [];
              this.body = "";
              this.subject = "";
              this.alert.message = err;
              this.alert.show = true;
              this.loading = false;
              this.alert.type = "error";
              this.check = [];
              this.selectedFormations = [];
            });
        } else {
          this.alert.message = "Vous devez saisir une adresse mail valide";
          this.alert.show = true;
          this.alert.type = "warning";
        }
      } else {
        this.alert.message = "Vous devez selectionner au moins une formation";
        this.alert.show = true;
        this.alert.type = "warning";
      }
      this.selectedFormations = [];

    },
    minimize() {
      this.minimizeAction = !this.minimizeAction;
    },
    checkFormation({ index, value }) {
      if (this.check.includes(index)) {
        this.selectedFormations.splice(this.check.indexOf(index), 1);
        this.check.splice(this.check.indexOf(index), 1);
      } else {
        this.check.push(index);
        this.selectedFormations.push(value);
      }
    },
    uncheckAllFormations() {
      this.check = [];
      this.selectedFormations = [];
    },
    checkAllFormations() {
      this.check = [];
      this.formations.forEach((element, index) => {
        this.check.push(index);
        this.selectedFormations.push(element);
      });
    },
    isActive(key) {
      return this.check.includes(key);
    },
    async loadFormations() {
      this.loading = true;
      await this.setData();
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.minimize-icon {
  padding: 5px;
}
.bottom-space {
  margin-bottom: 50px;
}
.indicateur {
    margin-left: 45%;
    font-size: -webkit-xxx-large;
    color: #1976d2;
    margin-bottom: 5%;
}
.objectif{
 color: #d21966;
}
</style>
