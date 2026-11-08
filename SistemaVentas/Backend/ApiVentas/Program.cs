using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngular", policy => 
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddSingleton<IMongoClient>(sp => 
    new MongoClient("mongodb+srv://naranjosebastian399_db_user:Tienda1234@cluster1castrocarazo.fomqu8x.mongodb.net/tienda_db?retryWrites=true&w=majority")
);

var app = builder.Build();
app.UseCors("AllowAngular");

decimal GetDecimal(BsonDocument doc, string campo)
{
    if (!doc.Contains(campo) || doc[campo] == null || doc[campo] == BsonNull.Value) return 0m;
    var val = doc[campo];
    if (val.IsDouble) return (decimal)val.AsDouble;
    if (val.IsInt32) return (decimal)val.AsInt32;
    if (val.IsInt64) return (decimal)val.AsInt64;
    if (val.IsDecimal128) return val.AsDecimal;
    if (val.IsString && decimal.TryParse(val.AsString, out var res)) return res;
    try { return val.ToDecimal(); } catch { return 0m; }
}

int GetInt(BsonDocument doc, string campo)
{
    if (!doc.Contains(campo) || doc[campo] == null || doc[campo] == BsonNull.Value) return 0;
    var val = doc[campo];
    if (val.IsInt32) return val.AsInt32;
    if (val.IsInt64) return (int)val.AsInt64;
    if (val.IsDouble) return (int)val.AsDouble;
    if (val.IsString && int.TryParse(val.AsString, out var res)) return res;
    try { return val.ToInt32(); } catch { return 0; }
}

string GetString(BsonDocument doc, string campo)
{
    if (!doc.Contains(campo) || doc[campo] == null || doc[campo] == BsonNull.Value) return "General";
    return doc[campo].ToString() ?? "General";
}

string GetVendedorNombre(BsonDocument doc, string campo)
{
    if (!doc.Contains(campo) || doc[campo] == null || doc[campo] == BsonNull.Value) return "Desconocido";
    var val = doc[campo];
    if (val.IsBsonDocument)
    {
        var sub = val.AsBsonDocument;
        if (sub.Contains("nombre")) return sub["nombre"].ToString() ?? "Desconocido";
    }
    return val.ToString() ?? "Desconocido";
}

string GetVendedorSucursal(BsonDocument doc, string campo)
{
    if (!doc.Contains(campo) || doc[campo] == null || doc[campo] == BsonNull.Value) return "Principal";
    var val = doc[campo];
    if (val.IsBsonDocument)
    {
        var sub = val.AsBsonDocument;
        if (sub.Contains("sucursal")) return sub["sucursal"].ToString() ?? "Principal";
    }
    return "Principal";
}


app.MapGet("/api/reportes/general", async (IMongoClient client) => {
    var db = client.GetDatabase("tienda_db");
    var documentos = await db.GetCollection<BsonDocument>("ventas").Find(_ => true).ToListAsync();

    if (!documentos.Any()) return Results.NotFound(new { mensaje = "No hay ventas" });

    var totales = documentos.Select(d => GetDecimal(d, "total")).ToList();

    return Results.Ok(new {
        facturacionTotal = totales.Sum(),
        ticketPromedio = totales.Any() ? totales.Average() : 0,
        totalTransacciones = documentos.Count,
        ventaMaxima = totales.Any() ? totales.Max() : 0,
        ventaMinima = totales.Any() ? totales.Min() : 0
    });
});


app.MapGet("/api/reportes/productos-mas-vendidos", async (IMongoClient client) => {
    var db = client.GetDatabase("tienda_db");
    var documentos = await db.GetCollection<BsonDocument>("ventas").Find(_ => true).ToListAsync();

    var ranking = documentos
        .GroupBy(d => new { 
            nombre = GetString(d, "producto"), 
            categoria = GetString(d, "categoria") 
        })
        .Select(g => new {
            nombre = g.Key.nombre,
            categoria = g.Key.categoria,
            cantidadTotalVendida = g.Sum(p => GetInt(p, "cantidad")),
            ingresoGenerado = g.Sum(p => GetDecimal(p, "total"))
        })
        .OrderByDescending(p => p.cantidadTotalVendida)
        .ToList();

    return Results.Ok(ranking);
});


app.MapGet("/api/reportes/vendedores", async (IMongoClient client) => {
    var db = client.GetDatabase("tienda_db");
    var documentos = await db.GetCollection<BsonDocument>("ventas").Find(_ => true).ToListAsync();

    var rendimiento = documentos
        .GroupBy(d => GetVendedorNombre(d, "vendedor"))
        .Select(g => new {
            nombre = g.Key,
            sucursal = GetVendedorSucursal(g.First(), "vendedor"),
            cantidadVentas = g.Count(),
            montoTotalVendido = g.Sum(v => GetDecimal(v, "total"))
        })
        .OrderByDescending(v => v.montoTotalVendido)
        .ToList();

    return Results.Ok(rendimiento);
});

app.Run();