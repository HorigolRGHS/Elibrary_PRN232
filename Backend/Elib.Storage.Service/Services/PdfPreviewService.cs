using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using PdfSharpCore.Drawing;

namespace Elib.Storage.Service.Services
{
    public class PdfPreviewService : IPdfPreviewService
    {
        public Task CreatePreviewWithWatermarkAsync(Stream input, Stream output, string watermark, int maxPages = 3)
        {
            if (input.CanSeek) input.Position = 0;

            using var src = PdfReader.Open(input, PdfDocumentOpenMode.Import);
            using var dst = new PdfDocument();

            int take = Math.Min(maxPages, src.PageCount);
            for (int i = 0; i < take; i++)
            {
                var imported = src.Pages[i];
                var page = dst.AddPage(imported);

                using var gfx = XGraphics.FromPdfPage(page, XGraphicsPdfPageOptions.Append);
                var font = new XFont("Arial", 36, XFontStyle.Bold);
                gfx.TranslateTransform(page.Width / 2, page.Height / 2);
                gfx.RotateTransform(-45);
                var rect = new XRect(-page.Width, -20, page.Width * 2, 40);

                var brush = new XSolidBrush(XColor.FromArgb(70, 255, 0, 0));
                gfx.DrawString(watermark, font, brush, rect, XStringFormats.Center);
            }

            dst.Save(output, false);
            output.Flush();
            output.Position = 0;
            return Task.CompletedTask;
        }
    }
}
