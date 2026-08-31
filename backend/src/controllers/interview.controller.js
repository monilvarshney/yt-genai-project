const pdfParse = require("pdf-parse")

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service")

const interviewReportModel = require("../models/interviewReport.model")



/**
 * @description
 * Controller to generate interview report based on:
 * - Job Description
 * - Self Description
 * - Resume PDF (optional)
 */
async function generateInterViewReportController(req, res) {

    try {

        // ==========================================
        // CHECK AUTHENTICATION
        // ==========================================

        if (!req.user) {

            return res.status(401).json({
                message: "User is not authenticated."
            })

        }


        // ==========================================
        // GET REQUEST DATA
        // ==========================================

        const {
            selfDescription,
            jobDescription
        } = req.body


        console.log("====================================")
        console.log("GENERATE INTERVIEW REPORT")
        console.log("====================================")

        console.log("User:", req.user.id)

        console.log(
            "Resume:",
            req.file
                ? req.file.originalname
                : "No resume uploaded"
        )

        console.log(
            "Job Description:",
            jobDescription
                ? "Received"
                : "Missing"
        )

        console.log(
            "Self Description:",
            selfDescription
                ? "Received"
                : "Missing"
        )


        // ==========================================
        // JOB DESCRIPTION REQUIRED
        // ==========================================

        if (
            !jobDescription ||
            !jobDescription.trim()
        ) {

            return res.status(400).json({
                message: "Job description is required."
            })

        }


        // ==========================================
        // RESUME OR SELF DESCRIPTION REQUIRED
        // ==========================================

        if (
            !req.file &&
            (
                !selfDescription ||
                !selfDescription.trim()
            )
        ) {

            return res.status(400).json({
                message:
                    "Please upload a resume or enter your self description."
            })

        }


        // ==========================================
        // RESUME IS OPTIONAL
        // ==========================================

        let resumeText = ""


        if (req.file) {

            console.log(
                "Resume file received:",
                req.file.originalname
            )

            console.log(
                "Resume file size:",
                req.file.size
            )


            // ======================================
            // CHECK BUFFER
            // ======================================

            if (!req.file.buffer) {

                return res.status(400).json({
                    message:
                        "Resume file buffer is missing."
                })

            }


            // ======================================
            // ONLY PDF ALLOWED
            // ======================================

            if (
                req.file.mimetype !==
                "application/pdf"
            ) {

                return res.status(400).json({
                    message:
                        "Only PDF resume files are supported."
                })

            }


            // ======================================
            // PARSE PDF
            // ======================================

            console.log(
                "Parsing resume PDF..."
            )


            const pdfData = await (
                new pdfParse.PDFParse(
                    Uint8Array.from(
                        req.file.buffer
                    )
                )
            ).getText()


            resumeText =
                pdfData.text || ""


            console.log(
                "Resume parsed successfully."
            )

        } else {

            console.log(
                "No resume uploaded."
            )

            console.log(
                "Using self description instead."
            )

        }


        // ==========================================
        // GENERATE AI INTERVIEW REPORT
        // ==========================================

        console.log(
            "Generating interview report using AI..."
        )


        const interViewReportByAi =
            await generateInterviewReport({

                resume: resumeText,

                selfDescription:
                    selfDescription || "",

                jobDescription

            })


        console.log(
            "AI interview report generated successfully."
        )


        console.log(
            "AI Response:",
            interViewReportByAi
        )


        // ==========================================
        // SAVE REPORT TO DATABASE
        // ==========================================

        const interviewReport =
            await interviewReportModel.create({

                // AI generated data
                ...interViewReportByAi,


                // Logged in user
                user: req.user.id,


                // Title is required in schema
                title:
                    interViewReportByAi?.title ||
                    "Interview Preparation",


                // Resume text
                resume: resumeText,


                // Self description
                selfDescription:
                    selfDescription || "",


                // Job description
                jobDescription

            })


        console.log(
            "Interview report saved successfully:",
            interviewReport._id
        )


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            message:
                "Interview report generated successfully.",

            interviewReport

        })

    } catch (error) {

        // ==========================================
        // ERROR HANDLING
        // ==========================================

        console.error(
            "===================================="
        )

        console.error(
            "GENERATE INTERVIEW REPORT ERROR"
        )

        console.error(
            error
        )

        console.error(
            "===================================="
        )


        return res.status(500).json({

            message:
                "Failed to generate interview report.",

            error:
                error.message

        })

    }

}



/**
 * @description
 * Get interview report by interview ID.
 */
async function getInterviewReportByIdController(
    req,
    res
) {

    try {

        const {
            interviewId
        } = req.params


        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewId,

                user: req.user.id

            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found."

            })

        }


        return res.status(200).json({

            message:
                "Interview report fetched successfully.",

            interviewReport

        })

    } catch (error) {

        console.error(
            "Get Interview Report Error:",
            error
        )


        return res.status(500).json({

            message:
                "Failed to fetch interview report.",

            error:
                error.message

        })

    }

}



/**
 * @description
 * Get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(
    req,
    res
) {

    try {

        const interviewReports =
            await interviewReportModel
                .find({
                    user: req.user.id
                })
                .sort({
                    createdAt: -1
                })
                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                )


        return res.status(200).json({

            message:
                "Interview reports fetched successfully.",

            interviewReports

        })

    } catch (error) {

        console.error(
            "Get All Interview Reports Error:",
            error
        )


        return res.status(500).json({

            message:
                "Failed to fetch interview reports.",

            error:
                error.message

        })

    }

}



/**
 * @description
 * Generate resume PDF based on saved interview report.
 */
async function generateResumePdfController(
    req,
    res
) {

    try {

        const {
            interviewReportId
        } = req.params


        // ==========================================
        // FIND INTERVIEW REPORT
        // ==========================================

        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewReportId,

                user: req.user.id

            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found."

            })

        }


        // ==========================================
        // GET REPORT DATA
        // ==========================================

        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport


        // ==========================================
        // GENERATE PDF
        // ==========================================

        const pdfBuffer =
            await generateResumePdf({

                resume,

                jobDescription,

                selfDescription

            })


        // ==========================================
        // SEND PDF
        // ==========================================

        res.set({

            "Content-Type":
                "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`

        })


        return res.send(pdfBuffer)

    } catch (error) {

        console.error(
            "Generate Resume PDF Error:",
            error
        )


        return res.status(500).json({

            message:
                "Failed to generate resume PDF.",

            error:
                error.message

        })

    }

}



/**
 * @description
 * Export all controllers.
 */
module.exports = {

    generateInterViewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController

}