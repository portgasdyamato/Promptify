from PIL import Image
import os

def additive_to_alpha(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            alpha = max(r, g, b)
            
            if alpha == 0:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                new_r = min(255, int((r * 255) / alpha))
                new_g = min(255, int((g * 255) / alpha))
                new_b = min(255, int((b * 255) / alpha))
                
                boosted_alpha = min(255, int(alpha * 1.4))
                
                pixels[x, y] = (new_r, new_g, new_b, boosted_alpha)
                
    img.save(output_path, "PNG")

files = ["asset1.png", "asset2.png", "asset3.png"]
for f in files:
    in_path = os.path.join("public", f)
    out_path = os.path.join("public", f)
    if os.path.exists(in_path):
        additive_to_alpha(in_path, out_path)
        print(f"Processed {f}")
