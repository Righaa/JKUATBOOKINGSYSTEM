namespace JkuatHospitalApi.Data
{
    public static class DoctorSpecialties
    {
        public static readonly string[] All =
        [
            "General Doctor",
            "Dentist",
            "Orthopedic",
            "Pediatrician",
            "Cardiologist",
            "Dermatologist",
            "Gynecologist",
            "Neurologist",
            "Psychiatrist",
            "Ophthalmologist"
        ];

        public static bool IsValid(string? specialty) =>
            !string.IsNullOrWhiteSpace(specialty) &&
            All.Contains(specialty, StringComparer.OrdinalIgnoreCase);
    }
}
