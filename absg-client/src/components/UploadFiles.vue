<template>
  <div>
    <v-row no-gutters justify="center" align="center">
      <v-col cols="8">
        <v-file-input
          :accept="inputAccept"
          multiple
          show-size
          :label="inputLabel"
          @change="selectFiles"

        />
      </v-col>

      <v-col cols="4" class="pl-2">
        <v-btn @click="uploadFiles">
          <v-icon left>fas fa-cloud-upload-alt</v-icon>
          Envoyer
        </v-btn>
      </v-col>
    </v-row>
    
    <div v-if="uploadProgress.progress && uploadProgress.progress < 100">
      <span>Récupération des fichiers... {{ uploadProgress.done || 1 }}/{{ uploadProgress.total }}</span>
      <v-progress-linear
        color="accent"
        indeterminate
      >
      </v-progress-linear>
    </div>
    <div v-if="uploadProgress.progress && uploadProgress.progress === 100">
      <span>Tous vos fichiers ont été récupérés.</span>
      <v-progress-linear
        color="accent"
        value="100"      >
      </v-progress-linear>
    </div>

    <v-alert v-if="message" border="left" color="teal" outlined class="multi-line">
      {{ message }}
    </v-alert>

    <v-card v-if="fileInfos.length > 0" class="mx-auto">
      <v-list>
        <v-subheader>Liste des fichiers envoyés sur le site Absolument G
        </v-subheader>
        <v-list-item-group color="primary">
            <v-list-item v-for="(file, index) in fileInfos" :key="index">
              <v-list-item-content>
                <v-list-item-title class="mb-3">
                  <a :href="file.url">{{ file.name }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <img :src="file.url" :alt="file.name" height="80px">
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios';
import { parseAxiosResponse } from '../middleware/CommonHelper';

export default {
  name: "UploadFiles",
    props: {
        inputLabel: {
            type: String,
            default: () => "Sélectionnez vos fichiers",
        },
        inputAccept: {
            type: String,
            default: () => "*/*"
        },
        disabled: {
            type: Boolean,
            default: () => false
        },
        uploadUrl: {
            type: Boolean,
            default: () => false
        }
    },
    data: () => ({
        progressInfos: null,
        selectedFiles: undefined,
        message: "",

        uploadProgress: {
          total: 0,
          done: 0,
          progress: null
        },

        fileInfos: []
    }),
    methods: {
        selectFiles(files) {
            this.progressInfos = [];
            this.selectedFiles = files;
        },
        uploadFiles() {
            this.message = "";
            this.uploadProgress.total = this.selectedFiles.length;
            this.uploadProgress.done = 0;
            this.uploadProgress.progress = 0;

            for (let i = 0; i < this.selectedFiles.length; i++) {
                this.upload(i, this.selectedFiles[i]);
            }
        },

        upload(idx, file) {
            this.progressInfos[idx] = { percentage: 0, fileName: file.name };

            let formData = new FormData();
            formData.append("file", file);

            axios.post(this.uploadUrl, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                onUploadProgress: progressEvent => {
                  this.progressInfos[idx].percentage = (progressEvent.loaded / progressEvent.total * 100 || 0);
                  
                  this.uploadProgress.progress = this.progressInfos.reduce((e, sum) => e + sum, 0);
                  console.log("dialog.onProgress", this.uploadProgress);
                  this.$emit("onProgress", this.uploadProgress);
                  
                }
            })
            .then(response => {
                const fileResult = parseAxiosResponse(response);
                this.progressInfos[idx].percentage = 100;
                this.uploadProgress.progress = this.progressInfos.reduce((e, sum) => e.percentage + sum, 0);
                this.uploadProgress.done += 1;
                this.$emit("onProgress", this.uploadProgress);
                console.log("dialog.onProgress", this.uploadProgress);
                this.$emit("fileUploaded", fileResult);
                console.log("UPLOAD DONE", fileResult);
            })
            .catch(err => {
                this.progressInfos[idx].percentage = 0;
                let prevMessage = this.message ? this.message + "\n" : "";
                this.message = prevMessage + "Impossible de récupérer le fichier: " + file.name;
                store.commit('onError', err);
            });
        }
    }
};
</script>