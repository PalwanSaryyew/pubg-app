// lib/auth.ts

import * as crypto from 'crypto';
import { env } from 'process';

// Next.js projenizin .env dosyasında BOT_TOKEN tanımlı olmalıdır.
const BOT_TOKEN = env.BOT_TOKEN; 

/**
 * Telegram Web App initData'yı SHA256 ve HMAC kullanarak doğrular.
 * @param initData - Telegram tarafından sağlanan sorgu dizesi (query string)
 * @returns Doğrulama başarılı ise true, aksi halde false.
 */
export function validateTelegramInitData(initData: string): boolean {
    if (!BOT_TOKEN) {
        console.error("BOT_TOKEN ortam değişkeni tanımlı değil.");
        return false;
    }

    // 1. initData'yı anahtar/değer çiftlerine ayır ve 'hash'i çıkar
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash'); // Doğrulama için hash'i kullanmayız

    if (!hash) {
        return false; // Hash yoksa doğrulama mümkün değil
    }

    // 2. Doğrulama için kullanılacak dizeyi oluştur: key1=value1\nkey2=value2
    // Telegram, parametreleri alfabetik sıraya göre sıralanmış ve \n ile ayrılmış ister.
    const dataCheckString = Array.from(params.entries())
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    // 3. Bot token'dan HMAC anahtarını oluştur
    const secret = crypto.createHmac('sha256', 'WebAppData')
        .update(BOT_TOKEN)
        .digest();

    // 4. Doğrulama dizesini (dataCheckString) kullanarak HMAC SHA256 hesapla
    const calculatedHash = crypto.createHmac('sha256', secret)
        .update(dataCheckString)
        .digest('hex');

    // 5. Hesaplanan hash ile gelen hash'i karşılaştır
    return calculatedHash === hash;
}

// initData'dan kullanıcı verilerini (JSON string) güvenli bir şekilde çıkarır.
export function getUserDataFromInitData(initData: string): unknown | null {
    const params = new URLSearchParams(initData);
    const userDataString = params.get('user') || params.get('receiver');
    
    if (userDataString) {
        try {
            return JSON.parse(userDataString);
        } catch (e) {
            console.error("Kullanıcı verisi JSON ayrıştırılamadı:", e);
            return null;
        }
    }
    return null;
}