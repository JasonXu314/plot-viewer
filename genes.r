library(Seurat)

rds <- readRDS(file = "./data.rds", refhook = NULL)

for (gene in rownames(rds@assays$RNA@counts)) {
	cat(gene)
	cat("\n")
}
