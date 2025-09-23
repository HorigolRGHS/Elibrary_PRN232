var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Elib_Storage_Service>("elib-storage-service");

builder.AddProject<Projects.Elib_Catalog_Service>("elib-catalog-service");

builder.AddProject<Projects.Elib_Auth_Service>("elib-auth-service");

builder.AddProject<Projects.Gatekeeper>("gatekeeper");

builder.AddProject<Projects.Elib_Activity_Service>("elib-activity-service");

builder.AddProject<Projects.Elib_Interaction_Service>("elib-interaction-service");

builder.Build().Run();
