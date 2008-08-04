from setuptools import setup, find_packages
import os

version = open(os.path.join("Products", "kupu", "version.txt")).read()
version = version.replace('kupu', '').strip() + 'dev'

setup(name='Products.kupu',
      version=version,
      description="",
      long_description=open(os.path.join("Products", "kupu", "doc", "README.txt")).read() + "\n" +
                       open(os.path.join("Products", "kupu", "doc", "CHANGES.txt")).read(),
      # Get more strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        "Programming Language :: JavaScript",
        "Topic :: Software Development :: Libraries :: Python Modules",
        ],
      keywords='',
      author='Kupu Team',
      author_email='kupu-dev@codespeak.net',
      url='http://kupu.oscom.org/',
      license='Kupu License',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['Products'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'zope.interface',
          'zope.schema',
          'zope.i18n',
          'zope.i18nmessageid',
          'Products.Archetypes',
          'Products.GenericSetup',
          'Products.CMFCore',
          'Products.CMFPlone',
          'Products.MimetypesRegistry',
          'Products.PortalTransforms',
          'Products.ATContentTypes',
          'Products.i18ntestcase',
          'plone.app.controlpanel',
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
