package org.collectionspace;

import ro.isdc.wro.extensions.processor.js.GoogleClosureCompressorProcessor;
import ro.isdc.wro.manager.factory.standalone.DefaultStandaloneContextAwareManagerFactory;
import ro.isdc.wro.model.resource.processor.factory.ProcessorsFactory;
import ro.isdc.wro.model.resource.processor.factory.SimpleProcessorsFactory;
import ro.isdc.wro.model.resource.processor.impl.BomStripperPreProcessor;
import ro.isdc.wro.model.resource.processor.impl.css.CssImportPreProcessor;
import ro.isdc.wro.model.resource.processor.impl.css.CssVariablesProcessor;
import ro.isdc.wro.model.resource.processor.impl.css.JawrCssMinifierProcessor;
import ro.isdc.wro.model.resource.processor.impl.js.SemicolonAppenderPreProcessor;

import com.google.javascript.jscomp.CompilationLevel;

public class CollectionSpaceFactory extends DefaultStandaloneContextAwareManagerFactory {
  protected ProcessorsFactory newProcessorsFactory() {
    final SimpleProcessorsFactory factory = new SimpleProcessorsFactory();
    factory.addPreProcessor(new BomStripperPreProcessor());
    factory.addPreProcessor(new CssImportPreProcessor());
    factory.addPreProcessor(new SemicolonAppenderPreProcessor());
    factory.addPreProcessor(new GoogleClosureCompressorProcessor(CompilationLevel.SIMPLE_OPTIMIZATIONS));
    factory.addPreProcessor(new JawrCssMinifierProcessor());
    factory.addPostProcessor(new CssVariablesProcessor());
    return factory;
  }
}