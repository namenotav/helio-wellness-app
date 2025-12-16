import{C as i,B as o}from"./entry-1765887266798-index.js";import{C as d}from"./chunk-1765887267003-index.js";class u{constructor(){this.isScanning=!1,this.apiKey="DEMO_KEY",this.scanMode="live"}async checkPermission(){try{if(!i.isNativePlatform())return{granted:!1,message:"Barcode scanning only available on mobile devices"};const e=await o.checkPermission({force:!0});return e.granted?{granted:!0}:e.denied?{granted:!1,message:"Camera permission denied. Enable in Settings."}:{granted:(await o.requestPermission()).granted}}catch(e){return{granted:!1,message:e.message}}}async captureBarcode(){try{const e=await d.getPhoto({quality:90,allowEditing:!1,resultType:"base64",source:"CAMERA",width:1920,height:1920,promptLabelHeader:"Scan Barcode",promptLabelPhoto:"Take Photo",promptLabelPicture:"From Gallery"});return{success:!0,imageData:e.base64String,format:e.format}}catch(e){return e.message.includes("cancel")?{success:!1,cancelled:!0,message:"Scan cancelled"}:{success:!1,error:e.message}}}async scanBarcodeFromImage(e){try{const n=await fetch("https://helio-wellness-app-production.up.railway.app/api/vision",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({prompt:`You are a barcode scanner. Analyze this image and extract the barcode number.

CRITICAL INSTRUCTIONS:
1. Look for UPC, EAN, or any numeric barcode
2. Return ONLY the barcode number, nothing else
3. If multiple barcodes, return the largest/most prominent one
4. If no barcode found, return "NO_BARCODE"

Return format: Just the barcode number (e.g., "012345678901")`,imageData:e}),mode:"cors"});if(!n.ok)throw new Error(`Server Error: ${n.status}`);const s=(await n.json()).analysis?.trim();if(!s||s==="NO_BARCODE")return{success:!1,message:"No barcode detected in image"};const a=s.replace(/[^0-9]/g,"");return a.length<8?{success:!1,message:"Invalid barcode detected"}:{success:!0,barcode:a}}catch(r){return{success:!1,error:r.message}}}async startScan(e=3e4){try{return await this.startLiveScan(e)}catch(r){throw r}}async startLiveScan(e=3e4){try{const r=await this.checkPermission();if(!r.granted)throw new Error(r.message||"Camera permission required");await o.prepare(),await o.hideBackground(),document.body.classList.add("barcode-scanning-active"),document.querySelector("html")?.classList.add("barcode-scanning-active"),this.isScanning=!0;const n=o.startScan(),t=new Promise((a,c)=>setTimeout(()=>c(new Error("Scan timeout - please try again")),e)),s=await Promise.race([n,t]);return this.stopScan(),s.hasContent?{success:!0,barcode:s.content,format:s.format}:{success:!1,message:"No barcode detected"}}catch(r){throw this.stopScan(),r}}stopScan(){this.isScanning=!1;try{o.stopScan(),o.showBackground(),document.body.classList.remove("barcode-scanning-active"),document.querySelector("html")?.classList.remove("barcode-scanning-active"),document.body.offsetHeight}catch{}}async lookupFoodByBarcode(e){try{const n=await(await fetch(`https://world.openfoodfacts.org/api/v0/product/${e}.json`)).json();if(n.status===1&&n.product){const t=n.product;return{success:!0,food:{name:t.product_name||"Unknown Product",brand:t.brands||"",barcode:e,calories:Math.round(t.nutriments?.["energy-kcal_100g"]||0),protein:Math.round(t.nutriments?.proteins_100g||0),carbs:Math.round(t.nutriments?.carbohydrates_100g||0),fat:Math.round(t.nutriments?.fat_100g||0),fiber:Math.round(t.nutriments?.fiber_100g||0),sugar:Math.round(t.nutriments?.sugars_100g||0),sodium:Math.round(t.nutriments?.sodium_100g||0),servingSize:t.serving_size||"100g",image:t.image_url||t.image_front_url||"",ingredients:t.ingredients_text||"",source:"OpenFoodFacts"}}}return this.apiKey&&this.apiKey!=="DEMO_KEY"?await this.lookupUSDAByBarcode(e):{success:!1,message:"Product not found in database"}}catch{return{success:!1,message:"Failed to lookup product"}}}async lookupUSDAByBarcode(e){try{return{success:!1,message:"Product not found in USDA database"}}catch{return{success:!1,message:"Failed to lookup in USDA database"}}}async searchOpenFoodFactsByText(e,r=1){try{const n=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(e)}&page=${r}&page_size=25&json=1&fields=product_name,nutriments,serving_size,brands,image_url,code`);if(!n.ok)throw new Error("OpenFoodFacts API request failed");const t=await n.json();if(!t.products||t.products.length===0)return{success:!1,message:"No foods found",foods:[]};const s=t.products.map(a=>({name:a.product_name||"Unknown Product",brand:a.brands||"",barcode:a.code||"",calories:Math.round(a.nutriments?.["energy-kcal_100g"]||0),protein:Math.round((a.nutriments?.proteins_100g||0)*10)/10,carbs:Math.round((a.nutriments?.carbohydrates_100g||0)*10)/10,fat:Math.round((a.nutriments?.fat_100g||0)*10)/10,serving_size:a.serving_size||"100g",image_url:a.image_url||"",source:"OpenFoodFacts",per:"100g"}));return{success:!0,foods:s,total:t.count||s.length,page:t.page||r}}catch{return{success:!1,message:"Failed to search OpenFoodFacts",foods:[]}}}async searchFoodsByText(e){try{if(!this.apiKey||this.apiKey==="DEMO_KEY")return{success:!0,foods:[{name:"Banana",calories:89,protein:1.1,carbs:23,fat:.3},{name:"Apple",calories:52,protein:.3,carbs:14,fat:.2}]};const r=await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(e)}&pageSize=20&api_key=${this.apiKey}`);if(!r.ok)throw new Error("USDA API request failed");const n=await r.json();return{success:!0,foods:n.foods?.map(s=>({name:s.description,fdcId:s.fdcId,calories:Math.round(s.foodNutrients?.find(a=>a.nutrientId===1008)?.value||0),protein:Math.round(s.foodNutrients?.find(a=>a.nutrientId===1003)?.value||0),carbs:Math.round(s.foodNutrients?.find(a=>a.nutrientId===1005)?.value||0),fat:Math.round(s.foodNutrients?.find(a=>a.nutrientId===1004)?.value||0),source:"USDA"}))||[],totalResults:n.totalHits}}catch{return{success:!1,message:"Failed to search USDA database",foods:[]}}}prepareScannerUI(){return`
      <style>
        .scanner-active {
          --background: transparent;
          --ion-background-color: transparent;
        }
        
        .scanner-ui {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          pointer-events: none;
        }
        
        .scanner-ui.active {
          display: block;
        }
        
        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .scanner-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 250px;
          height: 250px;
          border: 2px solid #00ff00;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }
        
        .scanner-instructions {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }
      </style>
    `}}const m=new u;export{m as barcodeScannerService,m as default};
