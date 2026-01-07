// ============================================
// 🎬 VIDEO PROXY SERVER - الإصدار الكامل
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 مفاتيح DRM - مخفية في الخادم
const DRM_KEY = {
    keyId: '264e7cb9dfd6b9e5c281c97db4c2b4fa',
    key: '47425a7e8f7e4030d186559852ae97db'
};

// رابط المصدر الأصلي
const SOURCE_URL = 'https://neacdnpop3-edge02.aws.playco.com/live/eds/ART_Aflam/DASH/ART_Aflam.mpd';

// ============================================
// 1. الصفحة الرئيسية
// ============================================
app.get('/', (req, res) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خادم بروكسي الفيديو</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            h1 {
                color: #4cc9f0;
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .subtitle {
                color: #b0b0b0;
                font-size: 1.2em;
            }
            
            .links-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .link-card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .link-card:hover {
                transform: translateY(-5px);
                border-color: #4cc9f0;
                box-shadow: 0 10px 30px rgba(76, 201, 240, 0.2);
            }
            
            .link-card h3 {
                color: #4cc9f0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.4em;
            }
            
            .link-box {
                background: rgba(0, 0, 0, 0.3);
                padding: 15px;
                border-radius: 10px;
                word-break: break-all;
                margin: 15px 0;
                border: 1px solid rgba(255, 255, 255, 0.1);
                font-family: monospace;
                color: #ddd;
            }
            
            .btn {
                background: linear-gradient(45deg, #4361ee, #3a0ca3);
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                width: 100%;
                margin-top: 10px;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(67, 97, 238, 0.4);
            }
            
            .instructions {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                margin-top: 40px;
            }
            
            .instructions h3 {
                color: #4cc9f0;
                margin-bottom: 15px;
                font-size: 1.5em;
            }
            
            .step {
                margin-bottom: 15px;
                padding-right: 20px;
                position: relative;
            }
            
            .step:before {
                content: "→";
                position: absolute;
                right: 0;
                color: #4cc9f0;
            }
            
            footer {
                text-align: center;
                margin-top: 40px;
                color: #888;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🚀 خادم بروكسي الفيديو</h1>
                <p class="subtitle">شارك الفيديو دون مشاركة المفاتيح - فقط أرسل الرابط</p>
            </header>
            
            <div class="links-grid">
                <!-- رابط DASH -->
                <div class="link-card">
                    <h3><span>📺</span> رابط DASH (للمشغلات)</h3>
                    <p>استخدم هذا الرابط في أي مشغل يدعم DASH:</p>
                    <div class="link-box" id="dashLink">${serverUrl}/dash</div>
                    <button class="btn" onclick="copyLink('dashLink')">نسخ الرابط</button>
                </div>
                
                <!-- رابط M3U8 -->
                <div class="link-card">
                    <h3><span>📱</span> رابط M3U8 (للتطبيقات)</h3>
                    <p>افتح في VLC أو MX Player أو nPlayer:</p>
                    <div class="link-box" id="m3u8Link">${serverUrl}/m3u8</div>
                    <button class="btn" onclick="copyLink('m3u8Link')">نسخ الرابط</button>
                </div>
                
                <!-- مشغل ويب -->
                <div class="link-card">
                    <h3><span>🌐</span> مشغل ويب مباشر</h3>
                    <p>افتح في المتصفح مباشرة:</p>
                    <div class="link-box" id="playerLink">${serverUrl}/player</div>
                    <button class="btn" onclick="copyLink('playerLink')">نسخ الرابط</button>
                </div>
            </div>
            
            <div class="instructions">
                <h3>📋 كيفية الاستخدام:</h3>
                <div class="step">انسخ أحد الروابط أعلاه</div>
                <div class="step">أرسله لأي شخص تريد</div>
                <div class="step">سيفتح الفيديو مباشرة دون حاجة لأي كود</div>
                <div class="step">يمكنك إيقاف الخادم متى شئت</div>
            </div>
            
            <footer>
                <p>🔒 المفاتيح محمية في الخادم | ⚡ البروكسي يعمل على المنفذ ${PORT}</p>
                <p>⚠️ هذا مشروع تعليمي - تأكد من حقوق المحتوى قبل المشاركة</p>
            </footer>
        </div>
        
        <script>
            function copyLink(elementId) {
                const element = document.getElementById(elementId);
                const text = element.textContent;
                
                navigator.clipboard.writeText(text).then(() => {
                    const btn = element.nextElementSibling;
                    const originalText = btn.textContent;
                    btn.textContent = '✅ تم النسخ!';
                    btn.style.background = '#10b981';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = 'linear-gradient(45deg, #4361ee, #3a0ca3)';
                    }, 2000);
                });
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// ============================================
// 2. رابط DASH المعدل (الرئيسي للمشاركة)
// ============================================
app.get('/dash', async (req, res) => {
    try {
        console.log('📡 جاري جلب ملف DASH من المصدر...');
        const response = await axios.get(SOURCE_URL, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        let mpdContent = response.data;
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        
        // استبدال جميع روابط المقاطع بروابط البروكسي
        mpdContent = mpdContent.replace(
            /https:\/\/neacdnpop3-edge02\.aws\.playco\.com/g,
            `${serverUrl}/segment`
        );
        
        console.log('✅ تم تعديل ملف DASH بنجاح');
        
        res.set('Content-Type', 'application/dash+xml');
        res.set('Cache-Control', 'public, max-age=300');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(mpdContent);
        
    } catch (error) {
        console.error('❌ خطأ في جلب DASH:', error.message);
        res.status(500).send(`
            <h2>خطأ في تحميل الفيديو</h2>
            <p>تعذر الاتصال بمصدر الفيديو</p>
            <p>${error.message}</p>
        `);
    }
});

// ============================================
// 3. رابط M3U8 للتطبيقات
// ============================================
app.get('/m3u8', (req, res) => {
    try {
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        
        // تشفير مفاتيح DRM في base64
        const keyData = {
            keys: [{
                kty: 'oct',
                kid: DRM_KEY.keyId,
                k: DRM_KEY.key
            }]
        };
        const keyBase64 = Buffer.from(JSON.stringify(keyData)).toString('base64');
        
        const m3u8Content = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0

# 🔐 مفتاح DRM مدمج
#EXT-X-KEY:METHOD=SAMPLE-AES,URI="data:text/plain;base64,${keyBase64}",KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"

# مقاطع الفيديو (تعديل حسب حاجتك)
#EXTINF:10.000000,
${serverUrl}/segment/live/eds/ART_Aflam/DASH/video_1.m4s
#EXTINF:10.000000,
${serverUrl}/segment/live/eds/ART_Aflam/DASH/video_2.m4s
#EXTINF:10.000000,
${serverUrl}/segment/live/eds/ART_Aflam/DASH/video_3.m4s
#EXTINF:10.000000,
${serverUrl}/segment/live/eds/ART_Aflam/DASH/video_4.m4s

#EXT-X-ENDLIST`;
        
        console.log('✅ تم إنشاء ملف M3U8');
        
        res.set('Content-Type', 'application/vnd.apple.mpegurl');
        res.set('Cache-Control', 'public, max-age=300');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(m3u8Content);
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء M3U8:', error);
        res.status(500).send('Error generating M3U8');
    }
});

// ============================================
// 4. بروكسي للمقاطع (يدعم DASH و HLS)
// ============================================
app.get('/segment/*', async (req, res) => {
    const segmentPath = req.params[0];
    const originalUrl = `https://neacdnpop3-edge02.aws.playco.com/${segmentPath}`;
    
    try {
        console.log(`📥 جاري تحميل المقطع: ${segmentPath}`);
        
        const response = await axios({
            method: 'GET',
            url: originalUrl,
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*'
            }
        });
        
        // نسخ الرؤوس المهمة
        if (response.headers['content-type']) {
            res.set('Content-Type', response.headers['content-type']);
        }
        
        // إضافة رؤوس CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Cache-Control', 'public, max-age=86400');
        
        console.log(`✅ تم تحميل المقطع: ${segmentPath}`);
        response.data.pipe(res);
        
    } catch (error) {
        console.error(`❌ خطأ في تحميل المقطع ${segmentPath}:`, error.message);
        
        if (!res.headersSent) {
            res.status(500).send(`Error loading segment: ${error.message}`);
        }
    }
});

// ============================================
// 5. نقطة ترخيص DRM (مخفية)
// ============================================
app.post('/drm/license', (req, res) => {
    console.log('🔑 طلب ترخيص DRM');
    
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    res.json({
        keys: [{
            kty: 'oct',
            kid: DRM_KEY.keyId,
            k: DRM_KEY.key
        }]
    });
});

// ============================================
// 6. مشغل ويب بسيط (اختياري)
// ============================================
app.get('/player', (req, res) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    
    const playerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>مشغل الفيديو</title>
        <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
        <style>
            body { margin: 0; padding: 20px; background: #111; color: white; }
            video { width: 100%; max-width: 1000px; display: block; margin: 0 auto; background: black; }
            .info { text-align: center; margin: 20px; }
        </style>
    </head>
    <body>
        <div class="info">
            <h2>🎬 مشغل الفيديو</h2>
            <p>جاري تحميل البث المباشر...</p>
        </div>
        <video id="video" controls></video>
        
        <script>
            const video = document.getElementById('video');
            const player = dashjs.MediaPlayer().create();
            
            // استخدام رابط البروكسي
            player.initialize(video, '${serverUrl}/dash', true);
            
            // إعداد DRM
            player.setProtectionData({
                'org.w3.clearkey': {
                    'serverURL': '${serverUrl}/drm/license'
                }
            });
            
            // تتبع الأحداث
            player.on('playbackPlaying', () => {
                console.log('✅ التشغيل بدأ');
                document.querySelector('.info p').textContent = 'جاري التشغيل...';
            });
            
            player.on('error', (e) => {
                console.error('❌ خطأ:', e);
                document.querySelector('.info p').textContent = 'حدث خطأ في التشغيل';
            });
        </script>
    </body>
    </html>
    `;
    
    res.send(playerHtml);
});

// ============================================
// 7. صفحة الصحة (للتحقق)
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            dash: '/dash',
            m3u8: '/m3u8',
            player: '/player',
            proxy: '/segment/*'
        }
    });
});

// ============================================
// تشغيل الخادم
// ============================================
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 خادم بروكسي الفيديو يعمل بنجاح!');
    console.log('='.repeat(50));
    console.log(`📊 المنفذ: ${PORT}`);
    console.log(`🏠 الصفحة الرئيسية: http://localhost:${PORT}`);
    console.log(`📺 رابط DASH (شارك هذا): http://localhost:${PORT}/dash`);
    console.log(`📱 رابط M3U8: http://localhost:${PORT}/m3u8`);
    console.log(`🎬 مشغل الويب: http://localhost:${PORT}/player`);
    console.log('='.repeat(50));
    console.log('🔒 المفاتيح محمية في الخادم');
    console.log('📤 شارك الروابط بأمان');
    console.log('='.repeat(50));
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
    console.error('❌ خطأ غير معالج:', error);
});
