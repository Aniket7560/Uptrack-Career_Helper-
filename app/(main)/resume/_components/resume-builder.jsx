// "use client"

// import { useState, useEffect } from "react"
// import { useForm, Controller } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { AlertTriangle, Download, Edit, Loader2, Monitor, Save } from "lucide-react"
// import { toast } from "sonner"
// import MDEditor from "@uiw/react-md-editor"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import { saveResume } from "@/actions/resume"
// import { EntryForm } from "./entry-form"
// import useFetch from "@/hooks/use-fetch"
// import { useUser } from "@clerk/nextjs"
// import { entriesToMarkdown } from "@/app/lib/helper"
// import { resumeSchema } from "@/app/lib/schema"

// export default function ResumeBuilder({ initialContent }) {
//   const [activeTab, setActiveTab] = useState("edit")
//   const [previewContent, setPreviewContent] = useState(initialContent)
//   const { user } = useUser()
//   const [resumeMode, setResumeMode] = useState("preview")

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(resumeSchema),
//     defaultValues: {
//       contactInfo: {},
//       summary: "",
//       skills: "",
//       experience: [],
//       education: [],
//       projects: [],
//     },
//   })

//   const { loading: isSaving, fn: saveResumeFn, data: saveResult, error: saveError } = useFetch(saveResume)

//   // Watch form fields for preview updates
//   const formValues = watch()

//   useEffect(() => {
//     if (initialContent) setActiveTab("preview")
//   }, [initialContent])

//   // Update preview content when form values change
//   useEffect(() => {
//     if (activeTab === "edit") {
//       const newContent = getCombinedContent()
//       setPreviewContent(newContent ? newContent : initialContent)
//     }
//   }, [formValues, activeTab])

//   // Handle save result
//   useEffect(() => {
//     if (saveResult && !isSaving) {
//       toast.success("Resume saved successfully!")
//     }
//     if (saveError) {
//       toast.error(saveError.message || "Failed to save resume")
//     }
//   }, [saveResult, saveError, isSaving])

//   const getContactMarkdown = () => {
//     const { contactInfo } = formValues
//     const parts = []
//     if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`)
//     if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`)
//     if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`)
//     if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`)

//     return parts.length > 0
//       ? `## <div align="center">${user.fullName}</div>
//         \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
//       : ""
//   }

//   const getCombinedContent = () => {
//     const { summary, skills, experience, education, projects } = formValues
//     return [
//       getContactMarkdown(),
//       summary && `## Professional Summary\n\n${summary}`,
//       skills && `## Skills\n\n${skills}`,
//       entriesToMarkdown(experience, "Work Experience"),
//       entriesToMarkdown(education, "Education"),
//       entriesToMarkdown(projects, "Projects"),
//     ]
//       .filter(Boolean)
//       .join("\n\n")
//   }

//   const [isGenerating, setIsGenerating] = useState(false);

//   const generatePDF = async () => {
//     setIsGenerating(true)
//     try {
//       const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js")).default

//       const element = document.getElementById("resume-pdf")
//       const opt = {
//         margin: [15, 15],
//         filename: "resume.pdf",
//         image: { type: "jpeg", quality: 0.98 },
//         html2canvas: { scale: 2 },
//         jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//       }

//       await html2pdf().set(opt).from(element).save()
//     } catch (error) {
//       console.error("PDF generation error:", error)
//       toast.error("Failed to generate PDF. Please try again.")
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const onSubmit = async (data) => {
//     try {
//       const formattedContent = previewContent
//         .replace(/\n/g, "\n") // Normalize newlines
//         .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
//         .trim()

//       console.log(previewContent, formattedContent)
//       await saveResumeFn(previewContent)
//     } catch (error) {
//       console.error("Save error:", error)
//     }
//   }

//   return (
//     <div data-color-mode="light" className="space-y-4">
//       <div className="flex flex-col md:flex-row justify-between items-center gap-2">
//         <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>
//         <div className="space-x-2">
//           <Button variant="destructive" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
//             {isSaving ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4" />
//                 Save
//               </>
//             )}
//           </Button>
//           <Button onClick={generatePDF} disabled={isGenerating}>
//             {isGenerating ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Generating PDF...
//               </>
//             ) : (
//               <>
//                 <Download className="h-4 w-4" />
//                 Download PDF
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="edit">Form</TabsTrigger>
//           <TabsTrigger value="preview">Markdown</TabsTrigger>
//         </TabsList>

//         <TabsContent value="edit">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//             {/* Contact Information */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Contact Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Email</label>
//                   <Input
//                     {...register("contactInfo.email")}
//                     type="email"
//                     placeholder="your@email.com"
//                     error={errors.contactInfo?.email}
//                   />
//                   {errors.contactInfo?.email && (
//                     <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Mobile Number</label>
//                   <Input {...register("contactInfo.mobile")} type="tel" placeholder="+1 234 567 8900" />
//                   {errors.contactInfo?.mobile && (
//                     <p className="text-sm text-red-500">{errors.contactInfo.mobile.message}</p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">LinkedIn URL</label>
//                   <Input
//                     {...register("contactInfo.linkedin")}
//                     type="url"
//                     placeholder="https://linkedin.com/in/your-profile"
//                   />
//                   {errors.contactInfo?.linkedin && (
//                     <p className="text-sm text-red-500">{errors.contactInfo.linkedin.message}</p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Twitter/X Profile</label>
//                   <Input
//                     {...register("contactInfo.twitter")}
//                     type="url"
//                     placeholder="https://twitter.com/your-handle"
//                   />
//                   {errors.contactInfo?.twitter && (
//                     <p className="text-sm text-red-500">{errors.contactInfo.twitter.message}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Summary */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Professional Summary</h3>
//               <Controller
//                 name="summary"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="Write a compelling professional summary..."
//                     error={errors.summary}
//                   />
//                 )}
//               />
//               {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
//             </div>

//             {/* Skills */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Skills</h3>
//               <Controller
//                 name="skills"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea {...field} className="h-32" placeholder="List your key skills..." error={errors.skills} />
//                 )}
//               />
//               {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
//             </div>

//             {/* Experience */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Work Experience</h3>
//               <Controller
//                 name="experience"
//                 control={control}
//                 render={({ field }) => <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />}
//               />
//               {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
//             </div>

//             {/* Education */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Education</h3>
//               <Controller
//                 name="education"
//                 control={control}
//                 render={({ field }) => <EntryForm type="Education" entries={field.value} onChange={field.onChange} />}
//               />
//               {errors.education && <p className="text-sm text-red-500">{errors.education.message}</p>}
//             </div>

//             {/* Projects */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Projects</h3>
//               <Controller
//                 name="projects"
//                 control={control}
//                 render={({ field }) => <EntryForm type="Project" entries={field.value} onChange={field.onChange} />}
//               />
//               {errors.projects && <p className="text-sm text-red-500">{errors.projects.message}</p>}
//             </div>
//           </form>
//         </TabsContent>

//         <TabsContent value="preview">
//           {activeTab === "preview" && (
//             <Button
//               variant="link"
//               type="button"
//               className="mb-2"
//               onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
//             >
//               {resumeMode === "preview" ? (
//                 <>
//                   <Edit className="h-4 w-4" />
//                   Edit Resume
//                 </>
//               ) : (
//                 <>
//                   <Monitor className="h-4 w-4" />
//                   Show Preview
//                 </>
//               )}
//             </Button>
//           )}

//           {activeTab === "preview" && resumeMode !== "preview" && (
//             <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
//               <AlertTriangle className="h-5 w-5" />
//               <span className="text-sm">You will lose edited markdown if you update the form data.</span>
//             </div>
//           )}
//           <div className="border rounded-lg">
//             <MDEditor value={previewContent} onChange={setPreviewContent} height={800} preview={resumeMode} />
//           </div>
//           <div className="hidden">
//             <div id="resume-pdf">
//               <MDEditor.Markdown
//                 source={previewContent}
//                 style={{
//                   background: "white",
//                   color: "black",
//                 }}
//               />
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }









"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Download, Edit, Loader2, Monitor, Save } from "lucide-react"
import { toast } from "sonner"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { saveResume } from "@/actions/resume"
import { EntryForm } from "./entry-form"
import useFetch from "@/hooks/use-fetch"
import { useUser } from "@clerk/nextjs"
import { entriesToMarkdown } from "@/app/lib/helper"
import { resumeSchema } from "@/app/lib/schema"

export default function ResumeBuilder({ initialContent = "" }) {
  const [activeTab, setActiveTab] = useState("edit")
  const [previewContent, setPreviewContent] = useState(initialContent || "")
  const { user } = useUser()
  const [resumeMode, setResumeMode] = useState("preview")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        email: "",
        mobile: "",
        linkedin: "",
        twitter: ""
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  })

  const { loading: isSaving, fn: saveResumeFn, data: saveResult, error: saveError } = useFetch(saveResume)

  // Watch form fields for preview updates
  const formValues = watch()

  // Initialize component after mount
  useEffect(() => {
    setIsInitialized(true)
    if (initialContent) {
      setActiveTab("preview")
      setPreviewContent(initialContent)
    }
  }, [initialContent])

  // Update preview content when form values change
  useEffect(() => {
    if (isInitialized && activeTab === "edit") {
      const newContent = getCombinedContent()
      setPreviewContent(newContent || initialContent || "")
    }
  }, [formValues, activeTab, isInitialized, initialContent])

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!")
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume")
    }
  }, [saveResult, saveError, isSaving])

  const getContactMarkdown = () => {
    const { contactInfo } = formValues
    if (!contactInfo || !user?.fullName) return ""
    
    const parts = []
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`)
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`)
    if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`)
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`)

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : `## <div align="center">${user.fullName}</div>`
  }

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n")
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Wait for DOM to be ready and element to exist
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const element = document.getElementById("resume-pdf")
      if (!element) {
        console.error("Resume PDF element not found in DOM")
        toast.error("Resume content not ready. Please try again.")
        return
      }

      // Check if element has content
      if (!element.innerHTML.trim()) {
        console.error("Resume PDF element is empty")
        toast.error("No resume content to generate PDF from.")
        return
      }

      try {
        const html2pdf = (await import("html2pdf.js")).default
        
        const opt = {
          margin: [15, 15],
          filename: `${user?.fullName?.replace(/\s+/g, '_') || 'resume'}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false // Reduce console noise
          },
          jsPDF: { 
            unit: "mm", 
            format: "a4", 
            orientation: "portrait" 
          },
        }

        await html2pdf().set(opt).from(element).save()
        toast.success("PDF downloaded successfully!")
        
      } catch (pdfError) {
        console.warn("html2pdf failed, using browser print fallback:", pdfError)
        
        // Fallback: Create a new window for printing
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          toast.error("Please allow pop-ups and try again.")
          return
        }
        
        printWindow.document.write(`
          <html>
            <head>
              <title>${user?.fullName || 'Resume'}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                h1, h2, h3 { color: #333; margin-top: 1.5em; }
                h1 { border-bottom: 2px solid #333; }
                h2 { border-bottom: 1px solid #666; }
                .markdown-body { max-width: none; }
                a { color: #0066cc; text-decoration: none; }
                a:hover { text-decoration: underline; }
                @media print {
                  body { margin: 0.5in; }
                  .no-print { display: none; }
                  h1 { break-after: avoid; }
                }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        
        // Auto-trigger print dialog
        printWindow.onload = () => {
          printWindow.print()
          printWindow.close()
        }
        
        toast.success("Print dialog opened. Please save as PDF from the print options.")
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\r\n/g, "\n") // Normalize Windows line endings
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim()

      await saveResumeFn(formattedContent)
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save resume. Please try again.")
    }
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading resume builder...</span>
      </div>
    )
  }

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">Resume Builder</h1>
        <div className="space-x-2">
          <Button variant="destructive" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating || !previewContent.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input {...register("contactInfo.mobile")} type="tel" placeholder="+1 234 567 8900" />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">{errors.contactInfo.mobile.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">{errors.contactInfo.linkedin.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter/X Profile</label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">{errors.contactInfo.twitter.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} className="h-32" placeholder="List your key skills..." />
                )}
              />
              {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />}
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => <EntryForm type="Education" entries={field.value} onChange={field.onChange} />}
              />
              {errors.education && <p className="text-sm text-red-500">{errors.education.message}</p>}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => <EntryForm type="Project" entries={field.value} onChange={field.onChange} />}
              />
              {errors.projects && <p className="text-sm text-red-500">{errors.projects.message}</p>}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">You will lose edited markdown if you update the form data.</span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor value={previewContent} onChange={setPreviewContent} height={800} preview={resumeMode} />
          </div>
          
        </TabsContent>
      </Tabs>

      {/* Hidden PDF content - always available regardless of active tab */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div id="resume-pdf" style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '20px',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.6'
        }}>
          <MDEditor.Markdown
            source={previewContent || "No content available"}
            style={{
              background: "white",
              color: "black",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.6"
            }}
          />
        </div>
      </div>
    </div>
  )
}