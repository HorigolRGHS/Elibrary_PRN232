using System.Text.RegularExpressions;

namespace SharedLibrary.Messages
{
    public static class TextCleaner
    {
        public static string CleanSpaces(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            string cleaned = Regex.Replace(input, @"\s+", " ");

            return cleaned.Trim();
        }
    }
}
