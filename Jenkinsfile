
pipeline {
  agent none
  stages {
    stage('unit tests') {
      agent { docker 'node:6.12.0' }
      steps {
        sh 'npm --version'
        sh 'npm install'
        sh 'npm test'
      }
    }
    stage ('integration tests') {
      agent { docker 'node:6.12.0' }
      steps {
        sh 'npm install -g aws-sam-local'
        sh 'sam local invoke "Edge" -e test/test.json'
        sh 'sam local invoke "Edge" -e test/good_cred.json'
        sh 'sam local invoke "Edge" -e test/bad_cred.json'
      }
    }
  }
}
