import {config} from "./config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {mergeImages} from "./services/SenitizeImage";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import vCardsJS from 'vcards-js';

const PORT = config.server.port

const app = express();
const corsConfig = {
    origin: config.client.url,
    credentials: true
}

app.use(express.static('public'))


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

        const ext = file.originalname.split('.').pop()

        cb(null, file.originalname.replace("."+ext, "") + '-' + uniqueSuffix + '.' + ext)
    }
})
const upload = multer({storage})

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsConfig));
app.use(morgan('combined'));

app.get("/health", (req, res) => {
  res.json({status: "ok"});
})

app.post('/ocr', upload.array('files'), async (req, res) => {

    const files = req.files as Express.Multer.File[];

    console.log("files", files);

    if (!files) {

         res.status(400).send('No files were uploaded.');

    }else{

        const paths = files.map(file => file.path);

        const outputFileName = Date.now()+".jpg";

        const data = await mergeImages(paths, `./public/${outputFileName}`);

        const url = config.services.ocr.url+"/ocr";

        const formData = new FormData();

        const uploadFile = await fs.promises.readFile(data);

        formData.append('file', uploadFile, 'file.pdf');

        console.log("headers", formData.getHeaders());

        axios.post(url,formData,{
            headers: {
                ...formData.getHeaders()
            },
        })
            .then(response => {
                console.log("response", response.data);

                const nameCardData = response.data;
                let vCard = vCardsJS();

// Set contact properties
                vCard.firstName = nameCardData["First Name"];
                vCard.lastName = nameCardData["Last Name"];
                vCard.organization = nameCardData["Company Name"];
                vCard.title = nameCardData["Job Title"];
                vCard.email = nameCardData["Email Address"];
                vCard.cellPhone = nameCardData["Mobile Phone Number"];
                vCard.workPhone = nameCardData["Office Phone Number"];
                vCard.workAddress =  {
                    /**
                     * Represents the actual text that should be put on the mailing label when delivering a physical package
                     */
                    label: nameCardData["Office Address 1"] ?? "",

                    /**
                     * Street address
                     */
                    street: nameCardData["Office Address 2"] ?? "",

                    /**
                     * City
                     */
                    city: nameCardData["Office Address 3"] ?? "",

                    /**
                     * State or province
                     */
                    stateProvince: "",

                    /**
                     * Postal code
                     */
                    postalCode: "",

                    /**
                     * Country or region
                     */
                    countryRegion: "",
                };

                const file_name = [
                    vCard.firstName?.replace(".", ""),
                    vCard.lastName?.replace(".", ""),
                    vCard.organization?.replace(".", "")
                ].filter(d=>d).map(name => name.toLowerCase().replace(/\s/g, "_")).join("_");

                const vcfPath = `/vcfs/${file_name}.vcf`;
                vCard.saveToFile('./public'+vcfPath);
                res.json({url:config.server.host + vcfPath}); // Set disposition and send it.
            })
            .catch(error => {
                console.log("error", error);
                res.status(500).send(error.response.data);
            })
    }

})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})