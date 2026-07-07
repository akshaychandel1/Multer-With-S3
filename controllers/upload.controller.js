import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import s3 from "../config/s3.js";

export const generateUploadUrl = async (req, res) => {

    try {

        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {

            return res.status(400).json({
                success: false,
                message: "Missing file information",
            });

        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(fileType)) {

            return res.status(400).json({
                success: false,
                message: "Invalid file type",
            });

        }

        const extension = fileName.split(".").pop();

        const key = `uploads/${crypto.randomUUID()}.${extension}`;

        const command = new PutObjectCommand({

            Bucket: process.env.AWS_BUCKET,

            Key: key,

            ContentType: fileType,

        });

        const uploadUrl = await getSignedUrl(
            s3,
            command,
            {
                expiresIn: 60,
            }
        );

        return res.status(200).json({

            success: true,

            uploadUrl,

            key,

            fileUrl: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};