var builder = DistributedApplication.CreateBuilder(args);

var rabbit = builder
    .AddContainer("rabbitmq", image: "rabbitmq", tag: "3.13-management")
    .WithEndpoint(
        name: "amqp",
        port: 5672,
        targetPort: 5672,
        scheme: "amqp")
    .WithHttpEndpoint(
        name: "mgmt",
        port: 15672,
        targetPort: 15672)
    .WithEnvironment("RABBITMQ_DEFAULT_USER", "guest")
    .WithEnvironment("RABBITMQ_DEFAULT_PASS", "guest");

builder.AddProject<Projects.Elib_Storage_Service>("elib-storage-service");

builder.AddProject<Projects.Elib_Catalog_Service>("elib-catalog-service");

builder.AddProject<Projects.Elib_Auth_Service>("elib-auth-service");

builder.AddProject<Projects.Gatekeeper>("gatekeeper");

builder.AddProject<Projects.Elib_Activity_Service>("elib-activity-service");

builder.AddProject<Projects.Elib_Interaction_Service>("elib-interaction-service");

builder.Build().Run();
