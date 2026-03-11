CREATE TABLE [dbo].[Categories]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Color] NVARCHAR(50) NOT NULL,
    [BudgetAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [SortOrder] INT NOT NULL DEFAULT 0,
    [MonthBudgetId] INT NOT NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Categories_MonthBudgets] FOREIGN KEY ([MonthBudgetId]) REFERENCES [dbo].[MonthBudgets]([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Categories_MonthBudgetId] ON [dbo].[Categories]([MonthBudgetId]);
GO
