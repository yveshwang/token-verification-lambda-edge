# Yves Hwang
# 30.11.2017

FROM ubuntu
MAINTAINER Yves Hwang <yveshwang@gmail.com>
LABEL name=jenkins-docker-2step
USER root
RUN apt-get update -qq
RUN DEBIAN_FRONTEND=noninteractive apt-get install -qy build-essential libssl-dev git man curl wget

ENV HOME /root
ENV NVM_DIR="$HOME/.nvm"

ENV NODE_VER v6.10.3

RUN git clone https://github.com/creationix/nvm.git $HOME/.nvm
RUN . $HOME/.nvm/nvm.sh && nvm install $NODE_VER && nvm alias default $NODE_VER && npm config set user 0 && npm config set unsafe-perm true && npm install -g aws-sam-local

RUN mkdir -p /workspace
VOLUME ["/workspace"]
WORKDIR  /workspace

CMD ["/bin/bash"]
