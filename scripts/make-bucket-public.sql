-- Hacer el bucket profile-images público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-images';

-- Verificar que el bucket es público
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'profile-images';