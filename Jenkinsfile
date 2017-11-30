
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
    stage('build docker') {
      agent {
        dockerfile {
          additionalBuildArgs '-t yves/samlocal:latest'
        }
      }
      steps {
        sh '. /root/.nvm/nvm.sh ; npm --version ; node --version'
      }
    }
    stage ('integration tests') {
      agent {
        docker {
          image 'yves/samlocal:latest'
          args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        sh 'pwd'
        sh 'echo be sure to use the file from the docker host'
        sh 'sam local invoke --docker-volume-basedir /vagrant/jenkins-data/workspace/pipelines-token-verification-lambda-edge -e test/test.json Edge'
        sh 'sam local invoke --docker-volume-basedir /vagrant/jenkins-data/workspace/pipelines-token-verification-lambda-edge -e test/good_cred.json Edge'
        sh 'sam local invoke --docker-volume-basedir /vagrant/jenkins-data/workspace/pipelines-token-verification-lambda-edge -e test/bad_cred.json Edge'
      }
    }
  }
}
