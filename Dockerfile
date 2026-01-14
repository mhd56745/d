FROM flussonic/flussonic:v26.01-22

# إنشاء المجلدات الأساسية
RUN mkdir -p /etc/flussonic/conf.d /var/www/hls /var/dvr

# نسخ ملف التكوين الرئيسي
COPY flussonic.conf /etc/flussonic/flussonic.conf

# فتح المنافذ المطلوبة
EXPOSE 80 443 1935 554 8080

# تشغيل Flussonic
CMD ["/usr/bin/flussonic", "--no-daemon"]
