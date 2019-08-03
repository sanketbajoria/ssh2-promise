FROM alpine:latest
RUN apk add --update openssh sudo openssh-server-pam\
    && sed -ri 's/#UsePAM no/UsePAM yes/g' /etc/ssh/sshd_config \
    && sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && echo root:root | chpasswd \
    && adduser -D sanket \
    && echo sanket:sanket | chpasswd \
    && mkdir /home/sanket/.ssh \
    && echo "sanket ALL=(ALL) ALL" >> /etc/sudoers \
    && rm  -rf /tmp/* /var/cache/apk/*
# add entrypoint script
ADD docker-entrypoint.sh /usr/local/bin
ADD authorized_keys /home/sanket/.ssh
#make sure we get fresh keys
RUN rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key

EXPOSE 22
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/sbin/sshd","-D"]