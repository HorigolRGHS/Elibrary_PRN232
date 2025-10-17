namespace SharedLibrary.Messages
{
    /// <summary>
    /// Request message to get user full names by their IDs
    /// </summary>
    public record UserFullNamesRequest(
        Guid RequestId,
        List<int> UserIds
    );

    /// <summary>
    /// Response message containing user full names mapped by user ID
    /// </summary>
    public record UserFullNamesResponse(
        Guid RequestId,
        Dictionary<int, string> UserFullNames
    );
}
