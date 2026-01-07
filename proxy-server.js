const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// 🔐 المفاتيح هنا في الخادم فقط
const DRM_KEYS = {
    '264e7cb9dfd6b9e5c281c97db4c2b4fa': '47425a7e8f7e4030d186559852ae97db'
};

// 1. رابط البروكسي الرئيسي
app.get('/proxy', (req, res) => {
    const serverUrl = `http://${req.get('host')}`;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Video Proxy Server</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .box { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 5px; }
                code { background: #333; color: white; padding: 10px; display: block; }
            </style>
        </head>
        <body>
            <h1>🔗 رابط البروكسي الجاهز</h1>
            
            <div class="box">
                <h3>📺 للبث المباشر:</h3>
                <code>${serverUrl}/stream</code>
                <p>افتح هذا الرابط في أي مشغل فيديو يدعم DASH/HLS</p>
            </div>
            
            <div class="box">
                <h3>🎬 للويب:</h3>
                <code>${serverUrl}/player</code>
                <p>افتح في المتصفح</p>
            </div>
            
            <div class="box">
                <h3>📱 للتطبيقات:</h3>
                <code>${serverUrl}/playlist.m3u8</code>
                <p>ضع في VLC أو MX Player</p>
            </div>
        </body>
        </html>
    `);
});

// 2. رابط الدفق المباشر (يدخل في أي مشغل)
app.get('/stream', async (req, res) => {
    try {
        const mpdUrl = 'https://neacdnpop3-edge02.aws.playco.com/live/eds/ART_Aflam/DASH/ART_Aflam.mpd';
        const response = await axios.get(mpdUrl);
        
        let mpdContent = response.data;
        // تعديل الروابط لتمر عبر البروكسي
        mpdContent = mpdContent.replace(
            /https:\/\/neacdnpop3-edge02\.aws\.playco\.com/g,
            `http://${req.get('host')}/segment`
        );
        
        res.set('Content-Type', 'application/dash+xml');
        res.send(mpdContent);
    } catch (error) {
        res.status(500).send('Proxy Error');
    }
});

// 3. رابط m3u8 للتطبيقات
app.get('/playlist.m3u8', (req, res) => {
    const serverUrl = `http://${req.get('host')}`;
    
    const m3u8Content = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-KEY:METHOD=SAMPLE-AES,URI="${serverUrl}/drm",KEYFORMAT="com.apple.streamingkeydelivery"

#EXTINF:10.000000,
${serverUrl}/segment/video1.ts
#EXTINF:10.000000,
${serverUrl}/segment/video2.ts
#EXTINF:10.000000,
${serverUrl}/segment/video3.ts
#EXT-X-ENDLIST`;
    
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(m3u8Content);
});

// 4. بروكسي للمقاطع
app.get('/segment/*', async (req, res) => {
    const path = req.params[0];
    const originalUrl = `https://neacdnpop3-edge02.aws.playco.com/${path}`;
    
    try {
        const response = await axios.get(originalUrl, {
            responseType: 'stream'
        });
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Segment not found');
    }
});

// 5. 🔒 نقطة DRM (المفتاح مخفي هنا)
app.get('/drm', (req, res) => {
    const keyData = {
        keys: [{
            kty: 'oct',
            kid: '264e7cb9dfd6b9e5c281c97db4c2b4fa',
            k: DRM_KEYS['264e7cb9dfd6b9e5c281c97db4c2b4fa']
        }]
    };
    
    res.json(keyData);
});

// 6. مشغل ويب بسيط (اختياري)
app.get('/player', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Video Player</title>
            <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
        </head>
        <body>
            <video id="video" controls width="800"></video>
            <script>
                const player = dashjs.MediaPlayer().create();
                player.initialize(
                    document.getElementById('video'),
                    '/stream',
                    true
                );
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 البروكسي يعمل على: http://localhost:${PORT}/proxy`);
    console.log(`📺 رابط البث: http://localhost:${PORT}/stream`);
    console.log(`📱 رابط m3u8: http://localhost:${PORT}/playlist.m3u8`);
});
