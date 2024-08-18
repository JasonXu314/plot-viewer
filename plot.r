library(Seurat)
library(sctransform)
#library(Matrix)
library(RColorBrewer) # colorRampPalette(), brewer.pal
library(ggplot2) # qplot(), position_nudge(), geom_text()
library(cowplot) # for plot_grid
library(gplots) # for heatmap2
library(dplyr) # for mutate, top_n# Setup the Seurat Object

args = commandArgs(trailingOnly = TRUE)

if (length(args) < 3) {
	stop("Invalid args")
}

rds <- readRDS(file = "./data.rds", refhook = NULL)

rds[["integrated"]] <- NULL
rds[["SCT"]] <- NULL

png("clustering.png",   
    width = 5*300,        # 5 x 300 pixels
    height = 4*300,
    res = 300,            # 300 pixels per inch
    pointsize = 12)        # smaller font size
DimPlot(rds, reduction = "umap", label = FALSE, group.by = args[2], cols = c("coral3", "deepskyblue3", "goldenrod2", "green3"))

marker_genes <- c(args[1])

png("violin.png",      
    width = 13*300, height = 13*300, res = 300,  pointsize = 4)  
VlnPlot(rds, assay = "RNA", features = marker_genes, pt.size = 0, split.by = args[3], group.by = args[2], cols = c("coral3", "deepskyblue3", "goldenrod2", "green3"), ncol = 4)
