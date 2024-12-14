import { createCanvas, loadImage }  from 'canvas';
import convert from 'heic-convert';
import fs from 'fs';

import { PDFDocument } from 'pdf-lib';

export async function mergeImages(imagePaths:string[], outputPath:string) {

    let _imagePaths = imagePaths;

    const supported_exts = ['HEIC', 'png', 'jpg', 'jpeg'];

    if(_imagePaths.some(path=>{
        const ext = path.split('.').pop();

        console.log('ext', ext);

        if(ext === undefined) throw new Error('Unsupported file format');
        return !supported_exts.includes(ext);
    })){
        throw new Error('Unsupported file format');
    }

    if(_imagePaths.every(path => path.endsWith('.HEIC'))){
        _imagePaths = await convertHeicToJpeg(_imagePaths);
    }else if(imagePaths.every(path => path.endsWith('.png'))){
        _imagePaths = await convertPngToJpeg(_imagePaths);
    }

    const outputPaths = [];
    for(const path of _imagePaths){
        const resizeImagePath = path.replace('.jpg', '_resized.jpg');
        await resizeImage(path, resizeImagePath, 2000, 2000)
        outputPaths.push(resizeImagePath);
    }

    await mergeHorizontal(outputPaths, outputPath);

    const resizeImagePath = outputPath.replace('.jpg', '_resized.jpg');

    await resizeImage(outputPath, resizeImagePath, 2000, 2000);

    const pdfPath = outputPath.replace('.jpg', '.pdf');

    await convertJpegToPdf(resizeImagePath, pdfPath);

    console.log("Conversion Done");

    return pdfPath
}

async function convertPngToJpeg(imagePaths:string[]){
    const outputPaths = [];

    for(const path of imagePaths){

        const buffer = await fs.promises.readFile(path)

        const jpegBuffer = await convert({
            buffer, // the HEIC file buffer
            format: 'JPEG', // output format
            quality: 1 // the jpeg compression quality, between 0 and 1
        }) as Buffer;

        const outputPath = path.replace('.png', '.jpg');

        await fs.promises.writeFile(outputPath, jpegBuffer);

        outputPaths.push(outputPath);
    }

    return outputPaths;
}

async function mergeHorizontal(imagePaths:string[], outputPath:string){
    const images = await Promise.all(imagePaths.map(path => loadImage(path)));

    // Create a canvas with the desired size
    const canvasWidth = images.reduce((totalWidth, img) => totalWidth + img.width, 0);
    const canvasHeight = Math.max(...images.map(img => img.height));
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw images onto the canvas
    let xOffset = 0;
    images.forEach(img => {
        ctx.drawImage(img, xOffset, 0);
        xOffset += img.width; // Update the yOffset for the next image
    });

    // Save the merged image to a file
    const buffer = canvas.toBuffer('image/jpeg');
    await fs.promises.writeFile(outputPath, buffer);
    console.log(`Merged image saved to ${outputPath}`);
}

async function mergeVertical(imagePaths:string[], outputPath:string){
    const images = await Promise.all(imagePaths.map(path => loadImage(path)));

    // Create a canvas with the desired size
    const canvasWidth = Math.max(...images.map(img => img.width));
    const canvasHeight = images.reduce((totalHeight, img) => totalHeight + img.height, 0);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw images onto the canvas
    let yOffset = 0;
    images.forEach(img => {
        ctx.drawImage(img, 0, yOffset);
        yOffset += img.height; // Update the yOffset for the next image
    });

    // Save the merged image to a file
    const buffer = canvas.toBuffer('image/jpeg');
    await fs.promises.writeFile(outputPath, buffer);
    console.log(`Merged image saved to ${outputPath}`);
}

async function convertHeicToJpeg(imagePaths:string[]){

    const outputPaths = [];

    for(const path of imagePaths){

        const buffer = await fs.promises.readFile(path)

        const jpegBuffer = await convert({
            buffer, // the HEIC file buffer
            format: 'JPEG', // output format
            quality: 1 // the jpeg compression quality, between 0 and 1
        }) as Buffer;

        const outputPath = path.replace('.HEIC', '.jpg');

        await fs.promises.writeFile(outputPath, jpegBuffer);

        outputPaths.push(outputPath);
    }

    return outputPaths;

}

async function resizeImage(imagePath:string, outputPath:string, width:number, height:number) {

    const img = await loadImage(imagePath)
    const aspectRatio = img.width / img.height
    let _width = Math.min(width, img.width)
    let _height = Math.min(height, img.height)

    if(img.width > img.height){
        _height = Math.round(_width / aspectRatio)
    }else{
        _width = Math.round(_height * aspectRatio)
    }

    const canvas = createCanvas(_width, _height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, _width, _height)
    const buffer = canvas.toBuffer('image/jpeg')
    await fs.promises.writeFile(outputPath, buffer)
    console.log(`Resized image saved to ${outputPath}`)
}

async function convertJpegToPdf(imagePath:string, outputPdfPath:string) {
    try {
        // Load the image as a Uint8Array
        const imageBytes = fs.readFileSync(imagePath);

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        // Embed the image in the PDF
        let pdfImage;

        pdfImage = await pdfDoc.embedJpg(imageBytes);

        // Get the dimensions of the image
        const { width, height } = pdfImage.scale(1);

        // Add a blank page to the PDF
        const page = pdfDoc.addPage([width, height]);

        // Draw the image onto the page
        page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Write the PDF to the output path
        fs.writeFileSync(outputPdfPath, pdfBytes);

        console.log(`PDF created successfully at: ${outputPdfPath}`);
    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}

// // Example usage
// const imagePaths = ['./imgs/IMG_2818.HEIC', './imgs/IMG_2819.HEIC']
// const outputPath = './imgs/mergedImage.jpg'
//
// mergeImages(imagePaths, outputPath)
//     .catch(err => console.error(err))