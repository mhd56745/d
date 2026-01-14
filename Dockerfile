FROM flussonic/flussonic:v26.01-22

# نسخ تكوينات مخصصة
COPY flussonic.conf /etc/flussonic/flussonic.conf
COPY conf.d/ /etc/flussonic/conf.d/

# فتح المنافذ
EXPOSE 80 443 1935 554 8080
