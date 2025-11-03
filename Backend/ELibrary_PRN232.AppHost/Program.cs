using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var rabbit = builder
    .AddRabbitMQ("rabbitmq")
    .WithImageTag("3.13-management")
    .WithManagementPlugin()
    .WithEnvironment("RABBITMQ_DEFAULT_USER", "app")
    .WithEnvironment("RABBITMQ_DEFAULT_PASS", "app");

builder.AddProject<Projects.Elib_Storage_Service>("elib-storage-service").WithReference(rabbit);

builder.AddProject<Projects.Elib_Catalog_Service>("elib-catalog-service").WithReference(rabbit);

builder.AddProject<Projects.Elib_Auth_Service>("elib-auth-service").WithReference(rabbit);

builder.AddProject<Projects.Gatekeeper>("gatekeeper");

builder.AddProject<Projects.Elib_Activity_Service>("elib-activity-service").WithReference(rabbit);

builder.AddProject<Projects.Elib_Interaction_Service>("elib-interaction-service").WithReference(rabbit);

builder.Build().Run();
