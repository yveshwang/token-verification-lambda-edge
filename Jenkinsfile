
pipeline {
  agent none
  stages {
    stage('unit tests') {
      agent {
        docker {
          image 'node:6.12.0'
        }
      }
      steps {
        sh 'npm --version'
        sh 'npm install'
        sh 'npm test'
      }
    }
  }
}
