# AppFabric Supabase geçiş sırası

Hedef proje: `bjhfsqgslbvvgcwwfmpp`.

1. İlk yönetici için `salikalper@gmail.com` e-posta adresiyle bir Supabase Auth kullanıcısı oluşturun.
   Bunu Dashboard > Authentication > Users > Add user ekranından yapabilirsiniz. En az 8 karakterli bir
   parola belirleyin ve `Auto Confirm User` seçeneğini açın. Migration, Dashboard'un ürettiği yeni Auth
   UUID'sini yönetici profiline taşır; demo profillerine bağlı pano ve görevleri yöneticiye devredip demo
   profillerini kaldırır. Sonraki kullanıcılar uygulamadaki yönetici ekranından oluşturulur.

   Alternatif olarak `scripts/bootstrap-auth-users.mjs` yalnızca yerel, güvenli bir terminalde service-role
   anahtarıyla çalıştırılabilir. Anahtarı hiçbir zaman web veya mobil uygulamaya koymayın.
2. `migrations/20260731063310_secure_auth_and_rls.sql` migration'ını uygulayın.
   Migration anonim erişimi kapatır, izinli Auth kullanıcılarına RLS tanımlar ve düz metin `password`
   sütununu kaldırır.
3. `user-admin` Edge Function'ını `verify_jwt=true` ile yayınlayın.
4. Supabase Dashboard > Authentication > Providers > Email altında yeni kullanıcı kaydını kapatın.
   Uygulama zaten profili olmayan Auth hesaplarını reddeder; bu ayar gereksiz Auth hesabı oluşmasını da önler.
5. Web ve mobil uygulamada bir admin ve bir normal kullanıcıyla giriş/veri CRUD testlerini çalıştırın.
