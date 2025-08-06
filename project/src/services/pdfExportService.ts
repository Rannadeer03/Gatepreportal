import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
}

class PDFExportService {
  async exportResume(resumeData: ResumeData, template: string = 'modern'): Promise<void> {
    try {
      // Create a temporary div to render the resume
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      
      // Render the resume content
      tempDiv.innerHTML = this.generateResumeHTML(resumeData, template);
      
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Save the PDF
      const fileName = `${resumeData.personalInfo.name || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }
  
  private generateResumeHTML(resumeData: ResumeData, template: string): string {
    const { personalInfo, experience, education, skills, projects, certifications, languages } = resumeData;
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    `;
    
    // Header
    html += `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #333;">
          ${personalInfo.name || 'Your Name'}
        </h1>
        <div style="font-size: 14px; color: #666; line-height: 1.5;">
          ${personalInfo.email ? `${personalInfo.email} • ` : ''}
          ${personalInfo.phone ? `${personalInfo.phone} • ` : ''}
          ${personalInfo.location || ''}
        </div>
        ${personalInfo.website ? `<div style="margin-top: 5px;">${personalInfo.website}</div>` : ''}
        ${personalInfo.linkedin ? `<div>LinkedIn: ${personalInfo.linkedin}</div>` : ''}
        ${personalInfo.github ? `<div>GitHub: ${personalInfo.github}</div>` : ''}
      </div>
    `;
    
    // Summary
    if (personalInfo.summary) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Professional Summary
          </h2>
          <p style="margin: 0; line-height: 1.5; color: #555;">
            ${personalInfo.summary}
          </p>
        </div>
      `;
    }
    
    // Experience
    if (experience.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Professional Experience
          </h2>
      `;
      
      experience.forEach(exp => {
        html += `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">
                ${exp.title}
              </h3>
              <span style="font-size: 12px; color: #666;">
                ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
              ${exp.company}${exp.location ? `, ${exp.location}` : ''}
            </div>
            <p style="margin: 0; line-height: 1.4; color: #555; font-size: 13px;">
              ${exp.description}
            </p>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Education
    if (education.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Education
          </h2>
      `;
      
      education.forEach(edu => {
        html += `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">
                ${edu.degree}
              </h3>
              <span style="font-size: 12px; color: #666;">
                ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}
              </span>
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">
              ${edu.institution}${edu.location ? `, ${edu.location}` : ''}
            </div>
            ${edu.gpa ? `<div style="font-size: 13px; color: #555; margin-bottom: 5px;">GPA: ${edu.gpa}</div>` : ''}
            ${edu.description ? `<p style="margin: 0; line-height: 1.4; color: #555; font-size: 13px;">${edu.description}</p>` : ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Skills
    if (skills.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Skills
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      `;
      
      skills.forEach(skill => {
        html += `
          <span style="background-color: #f3f4f6; color: #374151; padding: 4px 12px; border-radius: 15px; font-size: 12px;">
            ${skill.name}
          </span>
        `;
      });
      
      html += `</div></div>`;
    }
    
    // Projects
    if (projects.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Projects
          </h2>
      `;
      
      projects.forEach(project => {
        html += `
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0; color: #333;">
              ${project.name}
            </h3>
            ${project.technologies ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${project.technologies}</div>` : ''}
            <p style="margin: 0; line-height: 1.4; color: #555; font-size: 13px;">
              ${project.description}
            </p>
            ${project.link ? `<div style="margin-top: 5px; font-size: 12px; color: #3b82f6;">${project.link}</div>` : ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Certifications
    if (certifications.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Certifications
          </h2>
      `;
      
      certifications.forEach(cert => {
        html += `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: #333;">
                ${cert.name}
              </h3>
              <span style="font-size: 12px; color: #666;">
                ${cert.date}
              </span>
            </div>
            <div style="font-size: 12px; color: #666;">
              ${cert.issuer}
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Languages
    if (languages.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Languages
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
      `;
      
      languages.forEach(lang => {
        html += `
          <div style="font-size: 13px;">
            <span style="font-weight: bold; color: #333;">${lang.name}:</span>
            <span style="color: #666;"> ${lang.proficiency}</span>
          </div>
        `;
      });
      
      html += `</div></div>`;
    }
    
    html += `</div>`;
    
    return html;
  }
}

export const pdfExportService = new PDFExportService(); 