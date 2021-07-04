FROM alpine:3.9

ADD docker-entrypoint.sh /usr/local/bin

RUN sed -i 's/https\:\/\//http\:\/\//g' /etc/apk/repositories \
    && apk update \
    && apk add --update openssh sudo openssh-server-pam socat \
    && sed -ri 's/#UsePAM no/UsePAM yes/g' /etc/ssh/sshd_config \
    && sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -ri 's/^#?AllowTcpForwarding\s+.*/AllowTcpForwarding yes/' /etc/ssh/sshd_config \
    && echo root:root | chpasswd \
    && adduser -D sanket \
    && echo sanket:sanket | chpasswd \
    && mkdir /home/sanket/.ssh \
    && echo "sanket ALL=(ALL) ALL" >> /etc/sudoers \
    && rm  -rf /tmp/* /var/cache/apk/* \
    && rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

ADD authorized_keys /home/sanket/.ssh

EXPOSE 22
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/sbin/sshd","-D"]